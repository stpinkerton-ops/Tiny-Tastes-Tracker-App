
import React, { useState, useEffect, useCallback } from 'react';
import { Page, Food, TriedFoodLog, Recipe, UserProfile, MealPlan, ModalState, FoodLogData } from './types';
import { totalFoodCount } from './constants';
import Layout from './components/Layout';
import TrackerPage from './components/pages/TrackerPage';
import IdeasPage from './components/pages/IdeasPage';
import RecipesPage from './components/pages/RecipesPage';
import LogPage from './components/pages/LogPage';
import LearnPage from './components/pages/LearnPage';
import FamilyIdModal from './components/modals/FamilyIdModal';
import FoodLogModal from './components/modals/FoodLogModal';
import HowToServeModal from './components/modals/HowToServeModal';
import RecipeModal from './components/modals/RecipeModal';
import ViewRecipeModal from './components/modals/ViewRecipeModal';
import AiImportModal from './components/modals/AiImportModal';
import AiSuggestModal from './components/modals/AiSuggestModal';
import ShoppingListModal from './components/modals/ShoppingListModal';
import SelectRecipeModal from './components/modals/SelectRecipeModal';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, addDoc, Timestamp, deleteDoc, Unsubscribe, Firestore } from 'firebase/firestore';

// IMPORTANT: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3Qw1oZInrhteTAd7iOK1D2bMHMVCG4EE",
    authDomain: "tiny-tastes-tracker.firebaseapp.com",
    projectId: "tiny-tastes-tracker",
    storageBucket: "tiny-tastes-tracker.firebasestorage.app",
    messagingSenderId: "87950543929",
    appId: "1:87950543929:web:561607c04f73369f6411e8",
};

const APP_ID = "tiny-tastes-tracker";

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
} catch (error) {
    console.error("Error initializing Firebase:", error);
}


const App: React.FC = () => {
    const [familyId, setFamilyId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('tracker');
    const [triedFoods, setTriedFoods] = useState<TriedFoodLog[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPlan, setMealPlan] = useState<MealPlan>({});
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [modalState, setModalState] = useState<ModalState>({ type: null });

    const handleSetFamilyId = (id: string) => {
        localStorage.setItem('familyId', id);
        setFamilyId(id);
    };

    const handleLogOut = () => {
        localStorage.removeItem('familyId');
        setFamilyId(null);
        setTriedFoods([]);
        setRecipes([]);
        setMealPlan({});
        setUserProfile(null);
        setCurrentPage('tracker');
    };

    const saveProfile = async (profile: UserProfile) => {
        if (!familyId) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/profile/data`;
        await setDoc(doc(db, docPath), profile, { merge: true });
        setUserProfile(profile);
    };

    const saveTriedFood = async (foodName: string, data: FoodLogData) => {
        if (!familyId) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/triedFoods/${foodName}`;
        await setDoc(doc(db, docPath), data);
        setModalState({ type: null });
    };

    const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
        if (!familyId) return;
        const collectionPath = `/artifacts/${APP_ID}/users/${familyId}/recipes`;
        await addDoc(collection(db, collectionPath), {
            ...recipeData,
            createdAt: Timestamp.now()
        });
        setModalState({ type: null });
    };

    const deleteRecipe = async (recipeId: string) => {
        if (!familyId) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/recipes/${recipeId}`;
        await deleteDoc(doc(db, docPath));
        setModalState({ type: null });
    };
    
    const saveMealToPlan = async (date: string, meal: string, recipeId: string, recipeTitle: string) => {
        if (!familyId) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/mealPlan/${date}`;
        await setDoc(doc(db, docPath), { [meal]: { id: recipeId, title: recipeTitle } }, { merge: true });
        setModalState({ type: null });
    };

    const removeMealFromPlan = async (date: string, meal: string) => {
        if (!familyId) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/mealPlan/${date}`;
        const docRef = doc(db, docPath);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let data = docSnap.data();
            delete data[meal];
            await setDoc(docRef, data);
        }
    };


    useEffect(() => {
        const storedFamilyId = localStorage.getItem('familyId');
        if (storedFamilyId) {
            setFamilyId(storedFamilyId);
        } else {
            setLoading(false);
        }

        const unsubscribe = onAuthStateChanged(auth, user => {
            if (!user) {
                signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed", error));
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!familyId) return;
        
        setLoading(true);
        const listeners: Unsubscribe[] = [];

        // Profile listener
        const profileDocPath = `/artifacts/${APP_ID}/users/${familyId}/profile/data`;
        getDoc(doc(db, profileDocPath)).then(docSnap => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            }
        });

        // Tried Foods listener
        const triedFoodsPath = `/artifacts/${APP_ID}/users/${familyId}/triedFoods`;
        listeners.push(onSnapshot(collection(db, triedFoodsPath), snapshot => {
            setTriedFoods(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TriedFoodLog)));
        }));

        // Recipes listener
        const recipesPath = `/artifacts/${APP_ID}/users/${familyId}/recipes`;
        listeners.push(onSnapshot(collection(db, recipesPath), snapshot => {
            setRecipes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Recipe)));
        }));

        // Meal Plan listener
        const mealPlanPath = `/artifacts/${APP_ID}/users/${familyId}/mealPlan`;
        listeners.push(onSnapshot(collection(db, mealPlanPath), snapshot => {
            const newMealPlan: MealPlan = {};
            snapshot.docs.forEach(d => {
                newMealPlan[d.id] = d.data();
            });
            setMealPlan(newMealPlan);
        }));

        setLoading(false);
        
        return () => {
            listeners.forEach(unsub => unsub());
        };
    }, [familyId]);

    const renderPage = () => {
        const progress = {
            triedCount: triedFoods.length,
            totalCount: totalFoodCount
        };

        switch (currentPage) {
            case 'tracker':
                return <TrackerPage triedFoods={triedFoods} onFoodClick={(food: Food) => setModalState({ type: 'LOG_FOOD', food })} />;
            case 'ideas':
                return <IdeasPage userProfile={userProfile} triedFoods={triedFoods} onSaveProfile={saveProfile} onLogOut={handleLogOut} onFoodClick={(food: Food) => setModalState({ type: 'LOG_FOOD', food })}/>;
            case 'recipes':
                return <RecipesPage 
                    recipes={recipes} 
                    mealPlan={mealPlan}
                    onShowAddRecipe={() => setModalState({ type: 'ADD_RECIPE' })}
                    onShowImportRecipe={() => setModalState({ type: 'IMPORT_RECIPE' })}
                    onShowSuggestRecipe={() => setModalState({ type: 'SUGGEST_RECIPE' })}
                    onViewRecipe={(recipe) => setModalState({ type: 'VIEW_RECIPE', recipe })}
                    onAddToPlan={(date, meal) => setModalState({ type: 'SELECT_RECIPE', date, meal })}
                    onShowShoppingList={() => setModalState({ type: 'SHOPPING_LIST' })}
                />;
            case 'log':
                return <LogPage triedFoods={triedFoods} babyName={userProfile?.babyName} />;
            case 'learn':
                return <LearnPage />;
            default:
                return <TrackerPage triedFoods={triedFoods} onFoodClick={(food: Food) => setModalState({ type: 'LOG_FOOD', food })} />;
        }
    };

    const renderModals = () => {
        if (!modalState.type) return null;

        switch (modalState.type) {
            case 'LOG_FOOD': {
                // FIX: Capture the narrowed modalState in a local variable to ensure correct type inference.
                const state = modalState;
                const existingLog = triedFoods.find(f => f.id === state.food.name);
                return <FoodLogModal 
                    food={state.food} 
                    existingLog={existingLog}
                    onClose={() => setModalState({ type: null })} 
                    onSave={saveTriedFood}
                    onShowGuide={(food) => setModalState({ type: 'HOW_TO_SERVE', food })}
                />;
            }
            case 'HOW_TO_SERVE': {
                // FIX: Capture the narrowed modalState in a local variable to ensure correct type inference.
                const state = modalState;
                return <HowToServeModal food={state.food} onClose={() => setModalState({ type: 'LOG_FOOD', food: state.food })} />;
            }
            case 'ADD_RECIPE': {
                // FIX: Capture the narrowed modalState in a local variable to ensure correct type inference.
                const state = modalState;
                return <RecipeModal onClose={() => setModalState({ type: null })} onSave={addRecipe} initialData={state.recipeData} />;
            }
            case 'VIEW_RECIPE': {
                // FIX: Capture the narrowed modalState in a local variable to ensure correct type inference.
                const state = modalState;
                return <ViewRecipeModal recipe={state.recipe} onClose={() => setModalState({ type: null })} onDelete={deleteRecipe} />;
            }
            case 'IMPORT_RECIPE':
                return <AiImportModal 
                    onClose={() => setModalState({ type: null })} 
                    onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })}
                />;
            case 'SUGGEST_RECIPE':
                return <AiSuggestModal 
                    onClose={() => setModalState({ type: null })}
                    onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })}
                />;
            case 'SELECT_RECIPE': {
                // FIX: Capture the narrowed modalState in a local variable to ensure correct type inference.
                const state = modalState;
                return <SelectRecipeModal 
                    recipes={recipes} 
                    meal={state.meal}
                    onClose={() => setModalState({ type: null })}
                    onSelect={(recipe) => saveMealToPlan(state.date, state.meal, recipe.id, recipe.title)}
                />;
            }
            case 'SHOPPING_LIST':
                 return <ShoppingListModal
                    recipes={recipes}
                    mealPlan={mealPlan}
                    onClose={() => setModalState({ type: null })}
                />;
            default:
                return null;
        }
    };


    if (loading && !familyId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!familyId) {
        return <FamilyIdModal onJoin={handleSetFamilyId} />;
    }

    return (
        <>
            <Layout
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                profile={userProfile}
                familyId={familyId}
                progress={{ triedCount: triedFoods.length, totalCount: totalFoodCount }}
            >
                {renderPage()}
            </Layout>
            {renderModals()}
        </>
    );
};

export default App;
