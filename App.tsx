
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  writeBatch
} from 'firebase/firestore';

import firebaseConfig from './firebaseConfig.ts';

// Import types
import {
  Page,
  ModalState,
  TriedFoodLog,
  Recipe,
  UserProfile,
  MealPlan,
  Food,
  FoodLogData
} from './types.ts';

// Import constants
import { totalFoodCount } from './constants.ts';

// Import components
import Layout from './components/Layout.tsx';
import TrackerPage from './components/pages/TrackerPage.tsx';
import IdeasPage from './components/pages/IdeasPage.tsx';
import RecipesPage from './components/pages/RecipesPage.tsx';
import LogPage from './components/pages/LogPage.tsx';
import LearnPage from './components/pages/LearnPage.tsx';
import FamilyIdModal from './components/modals/FamilyIdModal.tsx';
import FoodLogModal from './components/modals/FoodLogModal.tsx';
import HowToServeModal from './components/modals/HowToServeModal.tsx';
import RecipeModal from './components/modals/RecipeModal.tsx';
import ViewRecipeModal from './components/modals/ViewRecipeModal.tsx';
import AiImportModal from './components/modals/AiImportModal.tsx';
import AiSuggestModal from './components/modals/AiSuggestModal.tsx';
import ShoppingListModal from './components/modals/ShoppingListModal.tsx';
import SelectRecipeModal from './components/modals/SelectRecipeModal.tsx';
import Icon from './components/ui/Icon.tsx';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  // State
  const [familyId, setFamilyId] = useState<string | null>(localStorage.getItem('familyId'));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [triedFoods, setTriedFoods] = useState<TriedFoodLog[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [currentPage, setCurrentPage] = useState<Page>('tracker');
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [loading, setLoading] = useState(true);

  // Effects for Firebase data syncing
  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubProfile = onSnapshot(doc(db, "families", familyId, "data", "profile"), (doc) => {
      setProfile(doc.data() as UserProfile || {});
    });

    const unsubTriedFoods = onSnapshot(collection(db, "families", familyId, "triedFoods"), (snapshot) => {
      const foods = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as TriedFoodLog[];
      setTriedFoods(foods);
    });

    const unsubRecipes = onSnapshot(collection(db, "families", familyId, "recipes"), (snapshot) => {
        const recipeData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Recipe[];
        setRecipes(recipeData);
    });
    
    const unsubMealPlan = onSnapshot(doc(db, "families", familyId, "data", "mealPlan"), (doc) => {
        setMealPlan(doc.data() as MealPlan || {});
    });

    // A check to see if all initial data has been loaded.
    // This is a bit naive, but good enough for this app.
    const timer = setTimeout(() => setLoading(false), 1500);

    return () => {
      unsubProfile();
      unsubTriedFoods();
      unsubRecipes();
      unsubMealPlan();
      clearTimeout(timer);
    };
  }, [familyId]);

  // Handlers
  const handleJoinFamily = async (id: string) => {
    // Check if family doc exists, if not, create it.
    const familyDocRef = doc(db, "families", id);
    const familyDoc = await getDoc(familyDocRef);
    if (!familyDoc.exists()) {
        const batch = writeBatch(db);
        batch.set(doc(db, "families", id, "data", "profile"), {});
        batch.set(doc(db, "families", id, "data", "mealPlan"), {});
        await batch.commit();
    }
    localStorage.setItem('familyId', id);
    setFamilyId(id);
  };

  const handleLogOut = () => {
    localStorage.removeItem('familyId');
    setFamilyId(null);
    setProfile(null);
    setTriedFoods([]);
    setRecipes([]);
    setMealPlan({});
    setCurrentPage('tracker');
  };

  const handleSaveProfile = useCallback(async (newProfile: UserProfile) => {
    if (!familyId) return;
    await setDoc(doc(db, "families", familyId, "data", "profile"), newProfile, { merge: true });
    alert("Profile saved!");
  }, [familyId]);

  const handleSaveFoodLog = useCallback(async (foodName: string, data: FoodLogData) => {
    if (!familyId) return;
    const logDocRef = doc(db, "families", familyId, "triedFoods", foodName);
    await setDoc(logDocRef, data, { merge: true });
    setModalState({ type: null });
  }, [familyId]);
  
  const handleSaveRecipe = useCallback(async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (!familyId) return;
    await addDoc(collection(db, "families", familyId, "recipes"), {
        ...recipeData,
        createdAt: serverTimestamp()
    });
    setModalState({ type: null });
  }, [familyId]);

  const handleDeleteRecipe = useCallback(async (recipeId: string) => {
    if (!familyId) return;
    await deleteDoc(doc(db, "families", familyId, "recipes", recipeId));
    setModalState({ type: null });
  }, [familyId]);

  const handleUpdateMealPlan = useCallback(async (newMealPlan: MealPlan) => {
    if (!familyId) return;
    await setDoc(doc(db, "families", familyId, "data", "mealPlan"), newMealPlan);
  }, [familyId]);
  
  const handleAddToPlan = (date: string, meal: string) => {
    setModalState({ type: 'SELECT_RECIPE', date, meal });
  };

  const handleSelectRecipeForPlan = (recipe: Recipe, date: string, meal: string) => {
    const newMealPlan = { ...mealPlan };
    if (!newMealPlan[date]) {
        newMealPlan[date] = {};
    }
    newMealPlan[date][meal] = { id: recipe.id, title: recipe.title };
    handleUpdateMealPlan(newMealPlan);
    setModalState({ type: null });
  };

  // Modal control
  const handleFoodClick = (food: Food) => {
    const existingLog = triedFoods.find(f => f.id === food.name);
    setModalState({ type: 'LOG_FOOD', food });
  };

  const closeModal = () => setModalState({ type: null });

  // Render logic
  if (!familyId) {
    return <FamilyIdModal onJoin={handleJoinFamily} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <Icon name="loader-circle" className="w-12 h-12 text-teal-600 animate-spin" />
            <p className="mt-2 text-lg font-medium text-gray-700">Loading your tracker...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'tracker':
        return <TrackerPage triedFoods={triedFoods} onFoodClick={handleFoodClick} />;
      case 'ideas':
        return <IdeasPage userProfile={profile} triedFoods={triedFoods} onSaveProfile={handleSaveProfile} onLogOut={handleLogOut} onFoodClick={handleFoodClick} />;
      case 'recipes':
        return <RecipesPage 
                    recipes={recipes} 
                    mealPlan={mealPlan} 
                    onShowAddRecipe={() => setModalState({ type: 'ADD_RECIPE' })}
                    onShowImportRecipe={() => setModalState({ type: 'IMPORT_RECIPE' })}
                    onShowSuggestRecipe={() => setModalState({ type: 'SUGGEST_RECIPE' })}
                    onViewRecipe={(recipe) => setModalState({ type: 'VIEW_RECIPE', recipe })}
                    onAddToPlan={handleAddToPlan}
                    onShowShoppingList={() => setModalState({ type: 'SHOPPING_LIST' })}
                />;
      case 'log':
        return <LogPage triedFoods={triedFoods} babyName={profile?.babyName} />;
      case 'learn':
        return <LearnPage />;
      default:
        return null;
    }
  };

  const renderModal = () => {
    const state = modalState;
    if (!state.type) return null;

    // Fix: Replaced switch statement with a series of if-statements.
    // This resolves a TypeScript type-narrowing issue where the compiler was not
    // correctly inferring the specific modal state type within each case, leading to
    // property access errors on the union type.
    if (state.type === 'LOG_FOOD') {
      return <FoodLogModal 
                  food={state.food} 
                  existingLog={triedFoods.find(f => f.id === state.food.name)}
                  onClose={closeModal} 
                  onSave={handleSaveFoodLog} 
                  onShowGuide={(food) => setModalState({ type: 'HOW_TO_SERVE', food })}
              />;
    }
    
    if (state.type === 'HOW_TO_SERVE') {
      return <HowToServeModal food={state.food} onClose={closeModal} />;
    }
    
    if (state.type === 'ADD_RECIPE') {
      return <RecipeModal 
                  onClose={closeModal} 
                  onSave={handleSaveRecipe} 
                  initialData={state.recipeData}
              />;
    }

    if (state.type === 'VIEW_RECIPE') {
      return <ViewRecipeModal recipe={state.recipe} onClose={closeModal} onDelete={handleDeleteRecipe} />;
    }
    
    if (state.type === 'IMPORT_RECIPE') {
      return <AiImportModal 
                  onClose={closeModal} 
                  onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} 
              />;
    }
    
    if (state.type === 'SUGGEST_RECIPE') {
      return <AiSuggestModal 
                  onClose={closeModal} 
                  onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} 
              />;
    }
    
    if (state.type === 'SHOPPING_LIST') {
      return <ShoppingListModal recipes={recipes} mealPlan={mealPlan} onClose={closeModal} />;
    }
    
    if (state.type === 'SELECT_RECIPE') {
      return <SelectRecipeModal 
                  recipes={recipes} 
                  meal={state.meal}
                  onClose={closeModal} 
                  onSelect={(recipe) => handleSelectRecipeForPlan(recipe, state.date, state.meal)} 
              />;
    }

    return null;
  };

  return (
    <>
      <Layout 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        profile={profile}
        familyId={familyId}
        progress={{ triedCount: triedFoods.length, totalCount: totalFoodCount }}
      >
        {renderPage()}
      </Layout>
      {renderModal()}
    </>
  );
}

export default App;
