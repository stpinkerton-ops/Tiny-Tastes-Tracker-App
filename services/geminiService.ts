
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types.ts';

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
        throw new Error("Gemini API key is not configured.");
    }
    return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const suggestRecipe = async (prompt: string): Promise<Partial<Recipe>> => {
  try {
    const ai = getAiClient();
    const fullPrompt = `You are a baby-led weaning recipe creator. A parent wants a recipe using the following ingredients: "${prompt}". 
    Create a simple recipe appropriate for a baby 6-12 months old. 
    Respond ONLY with a JSON object in the format {"title": "...", "ingredients": "...", "instructions": "..."}.
    Make sure ingredients are a bulleted list and instructions are a numbered list.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error suggesting recipe with AI:", error);
    throw new Error("Failed to generate recipe from AI.");
  }
};

export const importRecipeFromImage = async (file: File): Promise<Partial<Recipe>> => {
  try {
    const ai = getAiClient();
    const imagePart = await fileToGenerativePart(file);
    const textPart = {
      text: `You are a recipe parser. Extract the title, ingredients (as a bulleted list), and instructions (as a numbered list) from this image. Respond ONLY with a JSON object in the format {"title": "...", "ingredients": "...", "instructions": "..."}. If you cannot find one of the fields, return an empty string for it.`
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
        },
    });
    
    const text = response.text.trim();
    return JSON.parse(text);

  } catch (error) {
    console.error("Error importing recipe from image:", error);
    throw new Error("Failed to parse recipe from image.");
  }
};

export const categorizeShoppingList = async (ingredients: string[]): Promise<Record<string, string[]>> => {
    try {
        const ai = getAiClient();
        const prompt = `Categorize this shopping list into the following groups: Produce, Dairy, Meat, Pantry, and Other. Respond ONLY with a JSON object where keys are the categories and values are arrays of ingredients from this list. If an item doesn't fit, put it in 'Other'. \n\n${ingredients.join('\n')}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
            },
        });
        
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error categorizing shopping list:", error);
        throw new Error("Failed to categorize shopping list.");
    }
};