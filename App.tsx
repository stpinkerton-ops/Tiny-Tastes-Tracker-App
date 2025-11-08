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

// --- DEFINITIVE FIX: Interactive Configuration Checklist ---
const ConfigCheckPage: React.FC<{ error: string }> = ({ error }) => {
    const apiKey = firebaseConfig.apiKey;
    const currentUrl = window.location.origin;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard!");
        }, () => {
            alert("Failed to copy.");
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-3xl text-left bg-red-50 p-6 sm:p-8 rounded-lg shadow-xl border border-red-20al">
                <div className="flex items-center gap-4">
                    <Icon name="alert-triangle" className="w-12 h-12 text-red-500 flex-shrink-0" />
                    <div>
                        <h2 className="text-2xl font-bold text-red-800">Connection Error</h2>
                        <p className="mt-1 text-md text-red-700">Your app's security settings are working, but they need to be configured. Please follow the steps below.</p>
                    </div>
                </div>

                <div className="mt-6 space-y-6 bg-white p-6 rounded-md border border-gray-200">
                    {/* Step 1 */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Step 1: Open Your API Key Settings</h3>
                        <p className="text-sm text-gray-600 mt-1">This will take you to the Google Cloud Console where your keys are managed.</p>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block w-full text-center rounded-md bg-blue-600 text-white font-semibold text-sm p-2.5 hover:bg-blue-700">
                            Open Google Cloud API Credentials
                        </a>
                    </div>
                    <hr/>
                    {/* Step 2 */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Step 2: Find and Edit the Correct API Key</h3>
                        <p className="text-sm text-gray-600 mt-1">In the list of keys, find the exact one your app is using below. Click its name to edit it.</p>
                        <div className="mt-2 flex items-center">
                            <input type="text" readOnly value={apiKey} className="flex-grow rounded-l-md border-gray-300 bg-gray-100 font-mono text-sm p-2" />
                            <button onClick={() => copyToClipboard(apiKey)} className="bg-gray-200 p-2 rounded-r-md hover:bg-gray-300"><Icon name="copy" className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <hr/>
                    {/* Step 3 */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Step 3: Add Your Website URL</h3>
                        <p className="text-sm text-gray-600 mt-1">In the key's settings, under "Application restrictions", select "Websites". Then, under "Website restrictions", click "ADD" and paste this exact URL:</p>
                        <div className="mt-2 flex items-center">
                            <input type="text" readOnly value={`${currentUrl}/*`} className="flex-grow rounded-l-md border-gray-300 bg-gray-100 font-mono text-sm p-2" />
                            <button onClick={() => copyToClipboard(`${currentUrl}/*`)} className="bg-gray-200 p-2 rounded-r-md hover:bg-gray-300"><Icon name="copy" className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <hr/>
                    {/* Step 4 */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Step 4: Restrict the Key to Required APIs</h3>
                        <p className="text-sm text-gray-600 mt-1">This is a critical security step. Under "API restrictions", select "Restrict key" and make sure **both** of these APIs are in the list:</p>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-800 bg-gray-100 p-3 rounded-md">
                            <li><code className="font-semibold">Cloud Firestore API</code></li>
                            <li><code className="font-semibold">Identity Toolkit API</code> (for login)</li>
                        </ul>
                    </div>
                </div>
                 <div className="text-center">
                    <button onClick={() => window.location.reload()} className="mt-8 inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                        I've Saved My Changes, Now Refresh
                    </button>
                    <p className="text-xs text-gray-500 mt-2">(Note: It can take up to 5 minutes for settings to take effect)</p>
                 </div>
            </div>
        </div>
    );
};


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
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        
        signInAnonymously(auth)
          .then(() => {
            onAuthStateChanged(auth, (user) => {
              if (user) {
                setIsFirebaseReady(true);
                // Attach db for other effects to use
                (window as any).db = db; 
              } else {
                 setFirebaseError("Authentication failed unexpectedly. The user object is null.");
              }
            });
          })
          .catch((error) => {
            console.error("Firebase Anonymous Sign-In Failed:", error);
            setFirebaseError(error.message || "An unknown error occurred during Firebase setup.");
          });

    } catch(error: any) {
        console.error("Firebase Initialization Failed:", error);
        setFirebaseError(error.message || "A critical error occurred initializing Firebase.");
    }
  }, []);

  // Effects for Firebase data syncing
  useEffect(() => {
    const db = (window as any).db;
    if (!isFirebaseReady || !familyId || !db) {
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
    const db = (window as any).db;
    const familyDocRef = doc(db, "families", id);
    const familyDoc = await getDoc(familyDocRef);
    if (!familyDoc.exists()) {
        const batch = writeBatch(db);
        batch.set(doc(db, "families", id), { createdAt: serverTimestamp() });
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
    const db = (window as any).db;
    await setDoc(doc(db, "families", familyId, "data", "profile"), newProfile, { merge: true });
    alert("Profile saved!");
  }, [familyId]);

  const handleSaveFoodLog = useCallback(async (foodName: string, data: FoodLogData) => {
    if (!familyId) return;
    const db = (window as any).db;
    const logDocRef = doc(db, "families", familyId, "triedFoods", foodName);
    await setDoc(logDocRef, data, { merge: true });
    setModalState({ type: null });
  }, [familyId]);
  
  const handleSaveRecipe = useCallback(async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (!familyId) return;
    const db = (window as any).db;
    await addDoc(collection(db, "families", familyId, "recipes"), {
        ...recipeData,
        createdAt: serverTimestamp()
    });
    setModalState({ type: null });
  }, [familyId]);

  const handleDeleteRecipe = useCallback(async (recipeId: string) => {
    if (!familyId) return;
    const db = (window as any).db;
    await deleteDoc(doc(db, "families", familyId, "recipes", recipeId));
    setModalState({ type: null });
  }, [familyId]);

  const handleUpdateMealPlan = useCallback(async (newMealPlan: MealPlan) => {
    if (!familyId) return;
    const db = (window as any).db;
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
  const AppContent: React.FC = () => {
    if (firebaseError) {
        return <ConfigCheckPage error={firebaseError} />;
    }
    
    if (isLoading || !isFirebaseReady) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="loader-circle" className="w-12 h-12 text-teal-600 animate-spin" />
            <p className="mt-2 text-lg font-medium text-gray-700">Connecting to your tracker...</p>
          </div>
        </div>
      );
    }
    
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
    
    const renderModal = () => {
        if (modalState.type === null) {
            return null;
        }
        const state = modalState;
        switch (state.type) {
            case 'LOG_FOOD':
                return <FoodLogModal food={state.food} existingLog={triedFoods.find(f => f.id === state.food.name)} onClose={closeModal} onSave={handleSaveFoodLog} onShowGuide={(food) => setModalState({ type: 'HOW_TO_SERVE', food })} />;
            case 'HOW_TO_SERVE':
                return <HowToServeModal food={state.food} onClose={closeModal} />;
            case 'ADD_RECIPE':
                return <RecipeModal onClose={closeModal} onSave={handleSaveRecipe} initialData={state.recipeData} />;
            case 'VIEW_RECIPE':
                return <ViewRecipeModal recipe={state.recipe} onClose={closeModal} onDelete={handleDeleteRecipe} />;
            case 'IMPORT_RECIPE':
                return <AiImportModal onClose={closeModal} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SUGGEST_RECIPE':
                return <AiSuggestModal onClose={closeModal} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SHOPPING_LIST':
                return <ShoppingListModal recipes={recipes} mealPlan={mealPlan} onClose={closeModal} />;
            case 'SELECT_RECIPE':
                return <SelectRecipeModal recipes={recipes} meal={state.meal} onClose={closeModal} onSelect={(recipe) => handleSelectRecipeForPlan(recipe, state.date, state.meal)} />;
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

  return <AppContent />;
}

export default App;