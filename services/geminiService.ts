
import { Recipe } from '../types.ts';

// Helper to make authenticated requests to our Genkit flows
const callGenkitFlow = async (flowName: string, body: any) => {
    const response = await fetch(`/${flowName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request to ${flowName} failed: ${errorText}`);
    }
    return response.json();
};

// Helper to convert a file to a base64 string for JSON transport
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

export const suggestRecipe = async (prompt: string): Promise<Partial<Recipe>> => {
  try {
    return await callGenkitFlow('suggestRecipeFlow', prompt);
  } catch (error) {
    console.error("Error suggesting recipe via Genkit:", error);
    throw new Error("Failed to generate recipe from AI.");
  }
};

export const importRecipeFromImage = async (file: File): Promise<Partial<Recipe>> => {
  try {
    const base64Data = await fileToBase64(file);
    const body = {
        base64Data: base64Data,
        mimeType: file.type,
    };
    return await callGenkitFlow('importRecipeFlow', body);
  } catch (error) {
    console.error("Error importing recipe from image via Genkit:", error);
    throw new Error("Failed to parse recipe from image.");
  }
};

export const categorizeShoppingList = async (ingredients: string[]): Promise<Record<string, string[]>> => {
    try {
        return await callGenkitFlow('categorizeListFlow', ingredients);
    } catch (error) {
        console.error("Error categorizing shopping list via Genkit:", error);
        throw new Error("Failed to categorize shopping list.");
    }
};
