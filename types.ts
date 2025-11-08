// This file defines global types available on the `window` object in this platform,
// as well as the specific types for the application's data models.

// Fix: Define a named interface for the aistudio object to resolve a global type
// declaration conflict where the property was expected to be of type 'AIStudio'.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // The `aistudio` object is provided by the hosting platform for secure
    // management of the user's Gemini API key.
    aistudio?: AIStudio;
    // We polyfill `process.env` so the platform can inject the API key.
    process?: {
      env: {
        API_KEY?: string;
      };
    };
  }
}

export type Page = 'tracker' | 'ideas' | 'recipes' | 'log' | 'learn';
export type Filter = 'all' | 'to_try' | 'tried';
export type RecipeFilter = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Food {
    name: string;
    emoji: string;
}

export interface FoodCategory {
    category: string;
    color: string;
    textColor: string;
    borderColor: string;
    items: Food[];
}

export interface FoodLogData {
    reaction: number;
    date: string;
    moreThanOneBite: boolean;
    meal: string;
    allergyReaction: string;
    notes: string;
}

export interface TriedFoodLog extends FoodLogData {
    id: string; // The food name
}

export interface Recipe {
    id: string;
    title: string;
    ingredients: string;
    instructions: string;
    tags: string[];
    mealTypes: RecipeFilter[];
    createdAt: any; // Firebase Timestamp
}

export interface UserProfile {
    babyName?: string;
    birthDate?: string;
    knownAllergies?: string;
    pediatricianApproved?: boolean;
}

export interface MealPlan {
    [date: string]: {
        [meal: string]: {
            id: string;
            title: string;
        }
    }
}

// Modal State Types
type LogFoodModalState = { type: 'LOG_FOOD'; food: Food };
type HowToServeModalState = { type: 'HOW_TO_SERVE'; food: Food };
type AddRecipeModalState = { type: 'ADD_RECIPE'; recipeData?: Partial<Recipe> };
type ViewRecipeModalState = { type: 'VIEW_RECIPE'; recipe: Recipe };
type ImportRecipeModalState = { type: 'IMPORT_RECIPE' };
type SuggestRecipeModalState = { type: 'SUGGEST_RECIPE' };
// Fix: Corrected typo from SHOP_LIST to SHOPPING_LIST to match usage in App.tsx.
type ShoppingListModalState = { type: 'SHOPPING_LIST' };
type SelectRecipeModalState = { type: 'SELECT_RECIPE'; date: string; meal: string; };
type NullModalState = { type: null };

export type ModalState =
  | LogFoodModalState
  | HowToServeModalState
  | AddRecipeModalState
  | ViewRecipeModalState
  | ImportRecipeModalState
  | SuggestRecipeModalState
  | ShoppingListModalState
  | SelectRecipeModalState
  | NullModalState;
