
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
import firebaseConfig from './firebaseConfig.ts'; // Import the corrected config
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, addDoc, Timestamp, deleteDoc, Unsubscribe, Firestore } from 'firebase/firestore';

const APP_ID = "tiny-tastes-tracker";

interface FirebaseInstances {
    auth: Auth;
    db: Firestore;
}

const App: React.FC = () => {
    const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);
    const [initError, setInitError] = useState<React.ReactNode | null>(null);
    const [familyId, setFamilyId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('tracker');
    const [triedFoods, setTriedFoods] = useState<TriedFoodLog[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [mealPlan, setMealPlan] = useState<MealPlan>({});
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<ModalState>({ type: null });

    useEffect(() => {
        // **CRITICAL CHECK**: Verify the API key has been replaced.
        if (firebaseConfig.apiKey.includes("PASTE_YOUR_NEW_BROWSER_KEY_HERE")) {
            setInitError(
                <>
                    <h2 className="text-xl font-bold text-orange-700">Action Required: Update API Key</h2>
                    <p className="mt-2">The application cannot connect to Firebase because the API key has not been set.</p>
                    <ol className="list-decimal list-inside text-left mt-2 space-y-1">
                        <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">Google Cloud API Credentials Page</a> and create a new key.</li>
                        <li>Configure its "Website" and "API" restrictions as instructed previously.</li>
                        <li>Copy the new key.</li>
                        <li>Open the file <code className="text-sm bg-gray-100 p-1 rounded">firebaseConfig.ts</code> in your project.</li>
                        <li>Replace the placeholder text with your new API key.</li>
                    </ol>
                </>
            );
            setLoading(false);
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            setFirebase({ auth, db });

            const unsubscribe = onAuthStateChanged(auth, user => {
                if (!user) {
                    signInAnonymously(auth).catch(error => {
                        console.error("Anonymous sign-in failed", error);
                        const errorMessage = error.message || '';
                        const refererMatch = errorMessage.match(/requests-from-referer-([^)]+)-are-blocked/);

                        if (refererMatch && refererMatch[1]) {
                            const blockedUrl = refererMatch[1];
                            setInitError(
                                <>
                                    <p>Authentication failed. Your API key's security settings are blocking requests from this website.</p>
                                    <p className="mt-4"><strong>This is a security setting on Google's servers.</strong> To fix this, you must add the blocked website URL to your API key's "allowlist".</p>
                                    <ol className="list-decimal list-inside text-left mt-2 space-y-1">
                                        <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">Google Cloud API Credentials Page</a>.</li>
                                        <li>Select your project and click on the API key name.</li>
                                        <li>Under "Application restrictions," select "HTTP referrers (web sites)".</li>
                                        <li>Click "ADD" and enter the following URL: <br /> <code className="text-sm bg-gray-100 p-1 rounded break-all"><strong>{blockedUrl}/*</strong></code></li>
                                        <li>Click Save. It may take a few minutes to update.</li>
                                    </ol>
                                </>
                            );
                        } else if (error.code === 'auth/api-key-not-valid') {
                            setInitError(
                                <>
                                    <p>Authentication failed because the Firebase API key is not valid.</p>
                                    <p className="mt-2">This usually happens if the key in your code doesn't match the one in your Firebase project, or it has been deleted.</p>
                                    <p className="mt-4">Please verify the key in your `firebaseConfig.ts` file is correct and active in the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">Google Cloud Console</a>.</p>
                                </>
                            );
                        } else {
                            const friendlyMessage = `Authentication failed: ${error.message}. Please double-check your Firebase API Key and its restrictions in the Google Cloud Console.`;
                            setInitError(friendlyMessage);
                        }
                    });
                }
            });

            return () => unsubscribe();
        } catch (error: any) {
            console.error("Error initializing Firebase:", error);
            let detailedError: React.ReactNode = `The app could not start: ${error.message}. Please check your Firebase configuration.`;

            // Check if it's a network/permission error (like a 403 from getProjectConfig)
            if (error.message && (error.message.includes('403') || error.message.toLowerCase().includes('network request failed'))) {
                detailedError = (
                    <>
                        <p><strong>Firebase failed to initialize.</strong> This is almost always caused by an API key security setting.</p>
                        <p className="mt-4">Your key is likely blocking requests from this development environment's URL.</p>
                        <ol className="list-decimal list-inside text-left mt-2 space-y-1">
                            <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">Google Cloud API Credentials Page</a>.</li>
                            <li>Select your project and click on your API key's name.</li>
                            <li>Under "Application restrictions," select "HTTP referrers (web sites)".</li>
                            <li>Click "ADD" and enter the current website's URL origin: <br /> <code className="text-sm bg-gray-100 p-1 rounded break-all"><strong>{window.location.origin}/*</strong></code></li>
                            <li>Click Save. It may take a few minutes to update.</li>
                        </ol>
                    </>
                );
            }
            setInitError(detailedError);
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

    // Fix: Assign `modalState` to a local variable `state` to ensure stable type narrowing
    // for the discriminated union within the switch statement.
    const renderModals = () => {
        const state = modalState;
        if (!state.type) return null;

        switch (state.type) {
            case 'LOG_FOOD': {
                const existingLog = triedFoods.find(f => f.id === state.food.name);
                return <FoodLogModal food={state.food} existingLog={existingLog} onClose={() => setModalState({ type: null })} onSave={saveTriedFood} onShowGuide={(food) => setModalState({ type: 'HOW_TO_SERVE', food })} />;
            }
            case 'HOW_TO_SERVE':
                return <HowToServeModal food={state.food} onClose={() => setModalState({ type: 'LOG_FOOD', food: state.food })} />;
            case 'ADD_RECIPE':
                return <RecipeModal onClose={() => setModalState({ type: null })} onSave={addRecipe} initialData={state.recipeData} />;
            case 'VIEW_RECIPE':
                return <ViewRecipeModal recipe={state.recipe} onClose={() => setModalState({ type: null })} onDelete={deleteRecipe} />;
            case 'IMPORT_RECIPE':
                return <AiImportModal onClose={() => setModalState({ type: null })} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SUGGEST_RECIPE':
                return <AiSuggestModal onClose={() => setModalState({ type: null })} onRecipeParsed={(recipeData) => setModalState({ type: 'ADD_RECIPE', recipeData })} />;
            case 'SELECT_RECIPE':
                return <SelectRecipeModal recipes={recipes} meal={state.meal} onClose={() => setModalState({ type: null })} onSelect={(recipe) => saveMealToPlan(state.date, state.meal, recipe.id, recipe.title)} />;
            case 'SHOPPING_LIST':
                 return <ShoppingListModal recipes={recipes} mealPlan={mealPlan} onClose={() => setModalState({ type: null })} />;
            default:
                return null;
        }
    };

    if (initError) {
        return (
            <div className="flex items-center justify-center h-screen p-4">
                <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200 max-w-lg">
                    <h1 className="text-2xl font-bold text-red-700">Application Error</h1>
                    <div className="mt-2 text-gray-700">{initError}</div>
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
