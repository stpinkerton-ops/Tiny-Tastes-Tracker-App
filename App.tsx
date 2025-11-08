import React, { useState, useEffect } from 'react';
import { Page, Food, TriedFoodLog, Recipe, UserProfile, MealPlan, ModalState, FoodLogData } from './types.ts';
import { totalFoodCount } from './constants.ts';
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
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, addDoc, Timestamp, deleteDoc, Unsubscribe, Firestore } from 'firebase/firestore';

// This is the Firebase configuration. The apiKey here is a public identifier for your
// Firebase project and is NOT the secret key used for the Gemini API.
// It's safe to have this in your client-side code because security is handled
// by Firebase Security Rules, not this key.
const firebaseConfig = {
    apiKey: "AIzaSyA3Qw1oZInrhteTAd7iOK1D2bMHMVCG4EE",
    authDomain: "tiny-tastes-tracker.firebaseapp.com",
    projectId: "tiny-tastes-tracker",
    storageBucket: "tiny-tastes-tracker.firebasestorage.app",
    messagingSenderId: "87950543929",
    appId: "1:87950543929:web:561607c04f73369f6411e8",
};

const APP_ID = "tiny-tastes-tracker";

interface FirebaseInstances {
    auth: Auth;
    db: Firestore;
}

const App: React.FC = () => {
    const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);
    const [initError, setInitError] = useState<string | null>(null);
    const [familyId, setFamilyId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('tracker');
    const [triedFoods, setTriedFoods] = useState<TriedFoodLog[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPlan, setMealPlan] = useState<MealPlan>({});
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<ModalState>({ type: null });

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            setFirebase({ auth, db });

            const unsubscribe = onAuthStateChanged(auth, user => {
                if (!user) {
                    signInAnonymously(auth).catch(error => {
                        console.error("Anonymous sign-in failed", error);
                        setInitError("Authentication failed. The app cannot connect to the server.");
                    });
                }
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            setInitError("The app could not start. Please check the Firebase configuration.");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedFamilyId = localStorage.getItem('familyId');
        if (storedFamilyId) {
            setFamilyId(storedFamilyId);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!familyId || !firebase) return;
        
        setLoading(true);
        const { db } = firebase;
        const listeners: Unsubscribe[] = [];

        const profileDocPath = `/artifacts/${APP_ID}/users/${familyId}/profile/data`;
        getDoc(doc(db, profileDocPath)).then(docSnap => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            }
        });

        const triedFoodsPath = `/artifacts/${APP_ID}/users/${familyId}/triedFoods`;
        listeners.push(onSnapshot(collection(db, triedFoodsPath), snapshot => {
            setTriedFoods(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TriedFoodLog)));
        }, () => setLoading(false)));

        const recipesPath = `/artifacts/${APP_ID}/users/${familyId}/recipes`;
        listeners.push(onSnapshot(collection(db, recipesPath), snapshot => {
            setRecipes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Recipe)));
        }));

        const mealPlanPath = `/artifacts/${APP_ID}/users/${familyId}/mealPlan`;
        listeners.push(onSnapshot(collection(db, mealPlanPath), snapshot => {
            const newMealPlan: MealPlan = {};
            snapshot.docs.forEach(d => newMealPlan[d.id] = d.data());
            setMealPlan(newMealPlan);
        }));

        setLoading(false);
        
        return () => {
            listeners.forEach(unsub => unsub());
        };
    }, [familyId, firebase]);

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
        if (!familyId || !firebase) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/profile/data`;
        await setDoc(doc(firebase.db, docPath), profile, { merge: true });
        setUserProfile(profile);
    };

    const saveTriedFood = async (foodName: string, data: FoodLogData) => {
        if (!familyId || !firebase) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/triedFoods/${foodName}`;
        await setDoc(doc(firebase.db, docPath), data);
        setModalState({ type: null });
    };

    const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
        if (!familyId || !firebase) return;
        const collectionPath = `/artifacts/${APP_ID}/users/${familyId}/recipes`;
        await addDoc(collection(firebase.db, collectionPath), { ...recipeData, createdAt: Timestamp.now() });
        setModalState({ type: null });
    };

    const deleteRecipe = async (recipeId: string) => {
        if (!familyId || !firebase) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/recipes/${recipeId}`;
        await deleteDoc(doc(firebase.db, docPath));
        setModalState({ type: null });
    };
    
    const saveMealToPlan = async (date: string, meal: string, recipeId: string, recipeTitle: string) => {
        if (!familyId || !firebase) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/mealPlan/${date}`;
        await setDoc(doc(firebase.db, docPath), { [meal]: { id: recipeId, title: recipeTitle } }, { merge: true });
        setModalState({ type: null });
    };

    const removeMealFromPlan = async (date: string, meal: string) => {
        if (!familyId || !firebase) return;
        const docPath = `/artifacts/${APP_ID}/users/${familyId}/mealPlan/${date}`;
        const docRef = doc(firebase.db, docPath);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let data = docSnap.data();
            delete data[meal];
            await setDoc(docRef, data);
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'tracker':
                return <TrackerPage triedFoods={triedFoods} onFoodClick={(food: Food) => setModalState({ type: 'LOG_FOOD', food })} />;
            case 'ideas':
                return <IdeasPage userProfile={userProfile} triedFoods={triedFoods} onSaveProfile={saveProfile} onLogOut={handleLogOut} onFoodClick={(food: Food) => setModalState({ type: 'LOG_FOOD', food })}/>;
            case 'recipes':
                return <RecipesPage recipes={recipes} mealPlan={mealPlan} onShowAddRecipe={() => setModalState({ type: 'ADD_RECIPE' })} onShowImportRecipe={() => setModalState({ type: 'IMPORT_RECIPE' })} onShowSuggestRecipe={() => setModalState({ type: 'SUGGEST_RECIPE' })} onViewRecipe={(recipe) => setModalState({ type: 'VIEW_RECIPE', recipe })} onAddToPlan={(date, meal) => setModalState({ type: 'SELECT_RECIPE', date, meal })} onShowShoppingList={() => setModalState({ type: 'SHOPPING_LIST' })} />;
            case 'log':
                return <LogPage triedFoods={triedFoods} babyName={userProfile?.babyName} />;
            case 'learn':
                return <LearnPage />;
            default:
                return <TrackerPage triedFoods={triedFoods} onFoodClick={(food: Food) => setModalState({ type: 'LOG_FOOD', food })} />;
        }
    };

    // Fix: Replaced `state` with `modalState` to allow for correct type narrowing within the switch statement.
    const renderModals = () => {
        if (!modalState.type) return null;

        switch (modalState.type) {
            case 'LOG_FOOD': {
                const existingLog = triedFoods.find(f => f.id === modalState.food.name);
                return <FoodLogModal food={modalState.food} existingLog={existingLog} onClose={() => setModalState({ type: null })} onSave={saveTriedFood} onShowGuide={(food) => setModalState({ type: 'HOW_TO_SERVE', food })} />;
            }
            case 'HOW_TO_SERVE':
                return <HowToServeModal food={modalState.food} onClose={() => setModalState({ type: 'LOG_FOOD', food: modalState.food })} />;
            case 'ADD_RECIPE':
                return <RecipeModal onClose={() => setModalState({ type: null })} onSave={addRecipe} initialData={modalState.recipeData} />;
            case 'VIEW_RECIPE':
                return <ViewRecipeModal recipe={modalState.recipe} onClose={() => setModalState({ type: null })} onDelete={deleteRecipe} />;
            case 'IMPORT_RECIPE':
                return <AiImportModal onClose={() => setModalState({ type: null })} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SUGGEST_RECIPE':
                return <AiSuggestModal onClose={() => setModalState({ type: null })} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SELECT_RECIPE':
                return <SelectRecipeModal recipes={recipes} meal={modalState.meal} onClose={() => setModalState({ type: null })} onSelect={(recipe) => saveMealToPlan(modalState.date, modalState.meal, recipe.id, recipe.title)} />;
            case 'SHOPPING_LIST':
                 return <ShoppingListModal recipes={recipes} mealPlan={mealPlan} onClose={() => setModalState({ type: null })} />;
            default:
                return null;
        }
    };

    if (initError) {
        return (
            <div className="flex items-center justify-center h-screen p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Application Error</h1>
                    <p className="mt-2 text-gray-700">{initError}</p>
                </div>
            </div>
        );
    }
    
    if (loading) {
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
            <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} profile={userProfile} familyId={familyId} progress={{ triedCount: triedFoods.length, totalCount: totalFoodCount }}>
                {renderPage()}
            </Layout>
            {renderModals()}
        </>
    );
};

export default App;