import { https, logger } from 'firebase-functions';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { z } from 'zod';

// Initialize the Gemini AI client on the server.
// The API key should be set as an environment variable in your Firebase project.
// `firebase functions:config:set gemini.key="YOUR_API_KEY"`
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});

const RecipeSchema = z.object({
  title: z.string(),
  ingredients: z.string().or(z.array(z.string())),
  instructions: z.string(),
});

const ShoppingListSchema = z.object({
    'Produce': z.array(z.string()),
    'Dairy & Eggs': z.array(z.string()),
    'Meat & Fish': z.array(z.string()),
    'Pantry': z.array(z.string()),
    'Other': z.array(z.string()),
});


export const suggestRecipe = https.onCall(async (data, context) => {
    const { prompt } = data;
    if (!prompt || typeof prompt !== 'string') {
        throw new https.HttpsError('invalid-argument', 'The function must be called with a "prompt" argument.');
    }

    try {
        const fullPrompt = `You are a baby-led weaning recipe creator. A parent wants a recipe using the following ingredients: "${prompt}". Create a simple recipe appropriate for a baby 6-12 months old. Make sure ingredients are a bulleted list and instructions are a numbered list. Respond with only the JSON object.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    ingredients: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                  },
                },
            },
        });

        const recipeData = JSON.parse(response.text);
        if (Array.isArray(recipeData.ingredients)) {
            recipeData.ingredients = recipeData.ingredients.join('\n');
        }
        
        return RecipeSchema.parse(recipeData);

    } catch (error) {
        logger.error("Error in suggestRecipe function:", error);
        throw new https.HttpsError('internal', 'Failed to generate recipe from AI.', error);
    }
});


export const importRecipeFromImage = https.onCall(async (data, context) => {
    const { imageBase64, mimeType } = data;
    if (!imageBase64 || !mimeType) {
        throw new https.HttpsError('invalid-argument', 'The function must be called with "imageBase64" and "mimeType" arguments.');
    }

    try {
        const imagePart = { inlineData: { data: imageBase64, mimeType } };
        const textPart = { text: "You are a recipe parser. Extract the title, ingredients (as a bulleted list), and instructions (as a numbered list) from this image. If you cannot find one of the fields, return an empty string for it. Respond with only the JSON object." };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    ingredients: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                  },
                },
            },
        });

        const recipeData = JSON.parse(response.text);
        if (Array.isArray(recipeData.ingredients)) {
            recipeData.ingredients = recipeData.ingredients.join('\n');
        }
        
        return RecipeSchema.parse(recipeData);

    } catch (error) {
        logger.error("Error in importRecipeFromImage function:", error);
        throw new https.HttpsError('internal', 'Failed to parse recipe from image.', error);
    }
});


export const categorizeShoppingList = https.onCall(async (data, context) => {
    const { ingredients } = data;
    if (!ingredients || !Array.isArray(ingredients)) {
        throw new https.HttpsError('invalid-argument', 'The function must be called with an "ingredients" array.');
    }

    try {
        const prompt = `Categorize this shopping list into the following groups: Produce, Dairy & Eggs, Meat & Fish, Pantry, and Other. If an item doesn't fit, put it in 'Other'. \n\n${(ingredients as string[]).join('\n')}`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
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

        const listData = JSON.parse(response.text);
        return ShoppingListSchema.parse(listData);

    } catch (error) {
        logger.error("Error in categorizeShoppingList function:", error);
        throw new https.HttpsError('internal', 'Failed to categorize shopping list.', error);
    }
});
