


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
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

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
const auth = getAuth(app);

function App() {
  // State
  const [familyId, setFamilyId] = useState<string | null>(localStorage.getItem('familyId'));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [triedFoods, setTriedFoods] = useState<TriedFoodLog[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [currentPage, setCurrentPage] = useState<Page>('tracker');
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for Firebase Authentication
  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setIsFirebaseReady(true);
          } else {
            setFirebaseError("Authentication failed. Please check your connection and refresh.");
            setIsLoading(false);
          }
        });
      })
      .catch((error) => {
        console.error("Firebase Anonymous Sign-In Failed:", error);
        // This is a special check for the most common configuration error.
        if (error.code === 'auth/api-key-not-valid') {
            setFirebaseError(
              `Firebase initialization failed: The API Key is not valid.
              Please ensure you have created a new Browser Key in your Google Cloud Console and pasted it into the 'firebaseConfig.ts' file.`
            );
        } else if (error.message.includes('requests-from-referer')) {
            const blockedUrl = error.message.match(/https?:\/\/[^\s]+/)?.[0] || 'your current URL';
            setFirebaseError(
              `Firebase initialization failed because your website's URL is not authorized.
              Please add the following URL to your API key's "Website restrictions" in the Google Cloud Console: ${blockedUrl}`
            );
        } else {
             setFirebaseError(`An unknown error occurred during Firebase setup: ${error.message}`);
        }
        setIsLoading(false);
      });
  }, []);

  // Effects for Firebase data syncing - now depends on isFirebaseReady
  useEffect(() => {
    if (!isFirebaseReady || !familyId) {
        if(isFirebaseReady && !familyId) setIsLoading(false);
        return;
    }

    setIsLoading(true);

    const unsubProfile = onSnapshot(doc(db, "families", familyId, "data", "profile"), (doc) => {
      setProfile(doc.data() as UserProfile || {});
    }, (error) => console.error("Profile snapshot error:", error));

    const unsubTriedFoods = onSnapshot(collection(db, "families", familyId, "triedFoods"), (snapshot) => {
      const foods = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as TriedFoodLog[];
      setTriedFoods(foods);
    }, (error) => console.error("TriedFoods snapshot error:", error));

    const unsubRecipes = onSnapshot(collection(db, "families", familyId, "recipes"), (snapshot) => {
        const recipeData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Recipe[];
        setRecipes(recipeData);
    }, (error) => console.error("Recipes snapshot error:", error));
    
    const unsubMealPlan = onSnapshot(doc(db, "families", familyId, "data", "mealPlan"), (doc) => {
        setMealPlan(doc.data() as MealPlan || {});
    }, (error) => console.error("MealPlan snapshot error:", error));

    const timer = setTimeout(() => setIsLoading(false), 1200);

    return () => {
      unsubProfile();
      unsubTriedFoods();
      unsubRecipes();
      unsubMealPlan();
      clearTimeout(timer);
    };
  }, [familyId, isFirebaseReady]);

  // Handlers
  const handleJoinFamily = async (id: string) => {
    const familyDocRef = doc(db, "families", id);
    const familyDoc = await getDoc(familyDocRef);
    if (!familyDoc.exists()) {
        const batch = writeBatch(db);
        batch.set(doc(db, "families", id), { createdAt: serverTimestamp() }); // Create base doc
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

  const handleFoodClick = (food: Food) => {
    setModalState({ type: 'LOG_FOOD', food });
  };

  const closeModal = () => setModalState({ type: null });

  // Render logic
  const renderLoadingOrError = (Component: React.FC<any>) => (props: any) => {
    if (firebaseError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
            <Icon name="alert-triangle" className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="mt-4 text-xl font-bold text-red-800">Connection Error</h2>
            <p className="mt-2 text-sm text-red-700 whitespace-pre-wrap">{firebaseError}</p>
          </div>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="loader-circle" className="w-12 h-12 text-teal-600 animate-spin" />
            <p className="mt-2 text-lg font-medium text-gray-700">Loading your tracker...</p>
          </div>
        </div>
      );
    }
    return <Component {...props} />;
  };

  const AppContent: React.FC = () => {
    if (!familyId) {
      return <FamilyIdModal onJoin={handleJoinFamily} />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'tracker': return <TrackerPage triedFoods={triedFoods} onFoodClick={handleFoodClick} />;
            case 'ideas': return <IdeasPage userProfile={profile} triedFoods={triedFoods} onSaveProfile={handleSaveProfile} onLogOut={handleLogOut} onFoodClick={handleFoodClick} />;
            case 'recipes': return <RecipesPage recipes={recipes} mealPlan={mealPlan} onShowAddRecipe={() => setModalState({ type: 'ADD_RECIPE' })} onShowImportRecipe={() => setModalState({ type: 'IMPORT_RECIPE' })} onShowSuggestRecipe={() => setModalState({ type: 'SUGGEST_RECIPE' })} onViewRecipe={(recipe) => setModalState({ type: 'VIEW_RECIPE', recipe })} onAddToPlan={handleAddToPlan} onShowShoppingList={() => setModalState({ type: 'SHOPPING_LIST' })} />;
            case 'log': return <LogPage triedFoods={triedFoods} babyName={profile?.babyName} />;
            case 'learn': return <LearnPage />;
            default: return null;
        }
    };
    
    // Fix: Replaced a chain of `if` statements with a `switch` statement.
    // This provides better type narrowing for the discriminated union `ModalState`,
    // ensuring that properties like `food`, `recipe`, etc., are only accessed
    // on the correct state type, which resolves the TypeScript errors.
    const renderModal = () => {
        switch (modalState.type) {
            case null:
                return null;
            case 'LOG_FOOD':
                return <FoodLogModal food={modalState.food} existingLog={triedFoods.find(f => f.id === modalState.food.name)} onClose={closeModal} onSave={handleSaveFoodLog} onShowGuide={(food) => setModalState({ type: 'HOW_TO_SERVE', food })} />;
            case 'HOW_TO_SERVE':
                return <HowToServeModal food={modalState.food} onClose={closeModal} />;
            case 'ADD_RECIPE':
                return <RecipeModal onClose={closeModal} onSave={handleSaveRecipe} initialData={modalState.recipeData} />;
            case 'VIEW_RECIPE':
                return <ViewRecipeModal recipe={modalState.recipe} onClose={closeModal} onDelete={handleDeleteRecipe} />;
            case 'IMPORT_RECIPE':
                return <AiImportModal onClose={closeModal} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SUGGEST_RECIPE':
                return <AiSuggestModal onClose={closeModal} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SHOPPING_LIST':
                return <ShoppingListModal recipes={recipes} mealPlan={mealPlan} onClose={closeModal} />;
            case 'SELECT_RECIPE':
                return <SelectRecipeModal recipes={recipes} meal={modalState.meal} onClose={closeModal} onSelect={(recipe) => handleSelectRecipeForPlan(recipe, modalState.date, modalState.meal)} />;
            default:
                return null;
        }
    };

    return (
        <>
            <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} profile={profile} familyId={familyId} progress={{ triedCount: triedFoods.length, totalCount: totalFoodCount }}>
                {renderPage()}
            </Layout>
            {renderModal()}
        </>
    );
  }

  const FinalApp = renderLoadingOrError(AppContent);
  return <FinalApp />;
}

export default App;
