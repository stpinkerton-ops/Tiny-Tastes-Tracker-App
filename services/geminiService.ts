import { getFunctions, httpsCallable } from 'firebase/functions';
import { Recipe } from '../types.ts';

// This is the new, simplified, and secure client-side implementation.
// It calls our own backend Firebase Cloud Functions instead of Gemini AI directly.

const functions = getFunctions();

// Helper to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Result is "data:image/jpeg;base64,LzlqLzRBQ...". We want just the part after the comma.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const suggestRecipeFn = httpsCallable(functions, 'suggestRecipe');
export const suggestRecipe = async (prompt: string): Promise<Partial<Recipe>> => {
  try {
    const result = await suggestRecipeFn({ prompt });
    return result.data as Partial<Recipe>;
  } catch (error) {
    console.error("Error suggesting recipe via function:", error);
    throw new Error("Failed to generate recipe.");
  }
};

const importRecipeFromImageFn = httpsCallable(functions, 'importRecipeFromImage');
export const importRecipeFromImage = async (file: File): Promise<Partial<Recipe>> => {
  try {
    const imageBase64 = await fileToBase64(file);
    const result = await importRecipeFromImageFn({ imageBase64, mimeType: file.type });
    return result.data as Partial<Recipe>;
  } catch (error) {
    console.error("Error importing recipe from image via function:", error);
    throw new Error("Failed to parse recipe from image.");
  }
};

const categorizeShoppingListFn = httpsCallable(functions, 'categorizeShoppingList');
export const categorizeShoppingList = async (ingredients: string[]): Promise<Record<string, string[]>> => {
  try {
    const result = await categorizeShoppingListFn({ ingredients });
    return result.data as Record<string, string[]>;
  } catch (error) {
    console.error("Error categorizing shopping list via function:", error);
    throw new Error("Failed to categorize shopping list.");
  }
};
