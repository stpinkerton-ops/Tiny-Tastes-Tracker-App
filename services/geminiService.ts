import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Recipe } from '../types.ts';

// This is the client-side implementation for Gemini AI.

// A global variable to hold the initialized AI client.
let ai: GoogleGenAI | null = null;

// This function initializes the GoogleGenAI client.
// It uses the platform's secure `window.aistudio` API to prompt the user to select
// their secret Gemini API key if one hasn't been chosen yet.
const getAiClient = async (): Promise<GoogleGenAI> => {
    if (ai) {
        return ai;
    }

    // Check if the aistudio object is available
    if (window.aistudio) {
        // Check if a key has already been selected
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            // If not, open the platform's secure dialog to select one
            await window.aistudio.openSelectKey();
        }
    }

    // The API key is now available in process.env.API_KEY
    const apiKey = window.process?.env?.API_KEY;

    if (!apiKey) {
        console.error("Gemini API key is not set. Please select a key via the aistudio dialog.");
        throw new Error("Gemini API key not found. Please refresh and select a key to use AI features.");
    }

    ai = new GoogleGenAI({ apiKey });
    return ai;
};


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

const RecipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    ingredients: { type: Type.STRING },
    instructions: { type: Type.STRING },
  },
};

export const suggestRecipe = async (prompt: string): Promise<Partial<Recipe>> => {
  try {
    const client = await getAiClient();
    const fullPrompt = `You are a baby-led weaning recipe creator. A parent wants a recipe using the following ingredients: "${prompt}". Create a simple recipe appropriate for a baby 6-12 months old. Make sure ingredients are a bulleted list and instructions are a numbered list. Respond with only the JSON object.`;
    
    const response: GenerateContentResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: RecipeSchema,
        },
    });

    const recipeData = JSON.parse(response.text);
    
    // Normalize ingredients if they come back as an array
    if (Array.isArray(recipeData.ingredients)) {
        recipeData.ingredients = (recipeData.ingredients as string[]).join('\n');
    }

    return recipeData;

  } catch (error) {
    console.error("Error suggesting recipe with AI:", error);
    throw new Error("Failed to generate recipe from AI.");
  }
};

export const importRecipeFromImage = async (file: File): Promise<Partial<Recipe>> => {
  try {
    const client = await getAiClient();
    const base64Data = await fileToBase64(file);
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: file.type
        }
    };
    const textPart = {
        text: "You are a recipe parser. Extract the title, ingredients (as a bulleted list), and instructions (as a numbered list) from this image. If you cannot find one of the fields, return an empty string for it. Respond with only the JSON object."
    };

    const response: GenerateContentResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [imagePart, textPart] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: RecipeSchema,
        },
    });

    const recipeData = JSON.parse(response.text);

    // Normalize ingredients if they come back as an array
    if (Array.isArray(recipeData.ingredients)) {
        recipeData.ingredients = (recipeData.ingredients as string[]).join('\n');
    }

    return recipeData;
  } catch (error) {
    console.error("Error importing recipe from image:", error);
    throw new Error("Failed to parse recipe from image.");
  }
};


export const categorizeShoppingList = async (ingredients: string[]): Promise<Record<string, string[]>> => {
    try {
        const client = await getAiClient();
        const prompt = `Categorize this shopping list into the following groups: Produce, Dairy & Eggs, Meat & Fish, Pantry, and Other. If an item doesn't fit, put it in 'Other'. \n\n${ingredients.join('\n')}`;

        const response: GenerateContentResponse = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        'Produce': { type: Type.ARRAY, items: { type: Type.STRING } },
                        'Dairy & Eggs': { type: Type.ARRAY, items: { type: Type.STRING } },
                        'Meat & Fish': { type: Type.ARRAY, items: { type: Type.STRING } },
                        'Pantry': { type: Type.ARRAY, items: { type: Type.STRING } },
                        'Other': { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        });
        
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error categorizing shopping list:", error);
        throw new Error("Failed to categorize shopping list.");
    }
};