


import React, { useState, useEffect } from 'react';
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
        localStorage.setItem(`tiny-tastes-tracker-${familyId}-profile`, JSON.stringify(profile));
        setUserProfile(profile);
    };

    const saveTriedFood = async (foodName: string, data: FoodLogData) => {
        if (!familyId) return;
        const newTriedFoods = [...triedFoods.filter(f => f.id !== foodName), { id: foodName, ...data }];
        localStorage.setItem(`tiny-tastes-tracker-${familyId}-triedFoods`, JSON.stringify(newTriedFoods));
        setTriedFoods(newTriedFoods);
        setModalState({ type: null });
    };

    const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
        if (!familyId) return;
        const newRecipe: Recipe = {
            ...recipeData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        const updatedRecipes = [...recipes, newRecipe];
        localStorage.setItem(`tiny-tastes-tracker-${familyId}-recipes`, JSON.stringify(updatedRecipes));
        setRecipes(updatedRecipes);
        setModalState({ type: null });
    };

    const deleteRecipe = async (recipeId: string) => {
        if (!familyId) return;
        const updatedRecipes = recipes.filter(r => r.id !== recipeId);
        localStorage.setItem(`tiny-tastes-tracker-${familyId}-recipes`, JSON.stringify(updatedRecipes));
        setRecipes(updatedRecipes);
        
        // Also remove this recipe from meal plan
        const updatedMealPlan = { ...mealPlan };
        let mealPlanChanged = false;
        Object.keys(updatedMealPlan).forEach(date => {
            Object.keys(updatedMealPlan[date]).forEach(meal => {
                if (updatedMealPlan[date][meal].id === recipeId) {
                    delete updatedMealPlan[date][meal];
                    mealPlanChanged = true;
                }
            });
            if (Object.keys(updatedMealPlan[date]).length === 0) {
                delete updatedMealPlan[date];
            }
        });

        if (mealPlanChanged) {
            localStorage.setItem(`tiny-tastes-tracker-${familyId}-mealPlan`, JSON.stringify(updatedMealPlan));
            setMealPlan(updatedMealPlan);
        }
        setModalState({ type: null });
    };
    
    const saveMealToPlan = async (date: string, meal: string, recipeId: string, recipeTitle: string) => {
        if (!familyId) return;
        const updatedMealPlan = { ...mealPlan };
        if (!updatedMealPlan[date]) {
            updatedMealPlan[date] = {};
        }
        updatedMealPlan[date][meal] = { id: recipeId, title: recipeTitle };
        localStorage.setItem(`tiny-tastes-tracker-${familyId}-mealPlan`, JSON.stringify(updatedMealPlan));
        setMealPlan(updatedMealPlan);
        setModalState({ type: null });
    };

    const removeMealFromPlan = async (date: string, meal: string) => {
        if (!familyId) return;
        const updatedMealPlan = { ...mealPlan };
        if (updatedMealPlan[date]?.[meal]) {
            delete updatedMealPlan[date][meal];
            if (Object.keys(updatedMealPlan[date]).length === 0) {
                delete updatedMealPlan[date];
            }
            localStorage.setItem(`tiny-tastes-tracker-${familyId}-mealPlan`, JSON.stringify(updatedMealPlan));
            setMealPlan(updatedMealPlan);
        }
    };

    useEffect(() => {
        const storedFamilyId = localStorage.getItem('familyId');
        if (storedFamilyId) {
            setFamilyId(storedFamilyId);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!familyId) {
            // Clear data when logged out
            setTriedFoods([]);
            setRecipes([]);
            setMealPlan({});
            setUserProfile(null);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        
        const getFromStorage = <T,>(key: string, defaultValue: T): T => {
            try {
                const storedValue = localStorage.getItem(`tiny-tastes-tracker-${familyId}-${key}`);
                return storedValue ? JSON.parse(storedValue) : defaultValue;
            } catch (error) {
                console.error(`Error parsing ${key} from localStorage`, error);
                return defaultValue;
            }
        };
        
        setUserProfile(getFromStorage<UserProfile | null>('profile', null));
        setTriedFoods(getFromStorage<TriedFoodLog[]>('triedFoods', []));
        
        // Sanitize recipes on load to prevent runtime errors from old data formats
        const rawRecipes = getFromStorage<any[]>('recipes', []);
        const cleanedRecipes = rawRecipes.map((r): Recipe | null => {
            if (!r || typeof r !== 'object') return null;
            return {
                ...r,
                id: r.id || crypto.randomUUID(),
                title: r.title || 'Untitled Recipe',
                ingredients: Array.isArray(r.ingredients) ? r.ingredients.join('\n') : (typeof r.ingredients === 'string' ? r.ingredients : ''),
                instructions: Array.isArray(r.instructions) ? r.instructions.join('\n') : (typeof r.instructions === 'string' ? r.instructions : ''),
                tags: Array.isArray(r.tags) ? r.tags : [],
                mealTypes: Array.isArray(r.mealTypes) ? r.mealTypes : [],
                createdAt: r.createdAt || new Date().toISOString(),
            };
        }).filter((r): r is Recipe => r !== null);
        setRecipes(cleanedRecipes);

        setMealPlan(getFromStorage<MealPlan>('mealPlan', {}));

        setLoading(false);
        
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
                return <IdeasPage 
                    userProfile={userProfile} 
                    triedFoods={triedFoods} 
                    onSaveProfile={saveProfile} 
                    onLogOut={handleLogOut} 
                    onFoodClick={(food: Food) => setModalState({ type: 'LOG_FOOD', food })}
                    familyId={familyId}
                />;
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
        // FIX: Assign modalState to a local constant to help TypeScript with type narrowing.
        const modal = modalState;
        switch (modal.type) {
            case 'LOG_FOOD': {
                const existingLog = triedFoods.find(f => f.id === modal.food.name);
                return <FoodLogModal 
                    food={modal.food} 
                    existingLog={existingLog}
                    onClose={() => setModalState({ type: null })} 
                    onSave={saveTriedFood}
                    onShowGuide={(food) => setModalState({ type: 'HOW_TO_SERVE', food })}
                />;
            }
            case 'HOW_TO_SERVE': {
                return <HowToServeModal 
                    food={modal.food} 
                    onClose={() => setModalState({ type: 'LOG_FOOD', food: modal.food })} 
                />;
            }
            case 'ADD_RECIPE': {
                return <RecipeModal 
                    onClose={() => setModalState({ type: null })} 
                    onSave={addRecipe} 
                    initialData={modal.recipeData} 
                />;
            }
            case 'VIEW_RECIPE': {
                return <ViewRecipeModal 
                    recipe={modal.recipe} 
                    onClose={() => setModalState({ type: null })} 
                    onDelete={deleteRecipe} 
                />;
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
                return <SelectRecipeModal 
                    recipes={recipes} 
                    meal={modal.meal}
                    onClose={() => setModalState({ type: null })}
                    onSelect={(recipe) => saveMealToPlan(modal.date, modal.meal, recipe.id, recipe.title)}
                />;
            }
            case 'SHOPPING_LIST':
                 return <ShoppingListModal
                    recipes={recipes}
                    mealPlan={mealPlan}
                    onClose={() => setModalState({ type: null })}
                />;
            case null:
                return null;
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
