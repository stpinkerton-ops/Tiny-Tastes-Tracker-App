import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types.ts';

// Polyfill 'process' for browser environment to avoid ReferenceError from the SDK
if (typeof window.process === 'undefined') {
  window.process = { env: {} };
}

const getAiClient = async () => {
    // In this sandboxed environment, the API key is managed by the aistudio host.
    // We check if a key has been selected, and if not, we ask the user to select one.
    if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
    }
    
    // After the check, the aistudio host should have populated process.env.API_KEY
    const apiKey = window.process.env.API_KEY;
    if (!apiKey) {
        console.error("Gemini API key is not set. Please select a key via the aistudio dialog.");
        throw new Error("Gemini API key not found. Please refresh and select a key to use AI features.");
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

// Fix: Updated to use responseSchema for structured JSON output as per Gemini API guidelines.
export const suggestRecipe = async (prompt: string): Promise<Partial<Recipe>> => {
  try {
    const ai = await getAiClient();
    const fullPrompt = `You are a baby-led weaning recipe creator. A parent wants a recipe using the following ingredients: "${prompt}". 
    Create a simple recipe appropriate for a baby 6-12 months old. 
    Make sure ingredients are a bulleted list and instructions are a numbered list.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            ingredients: { type: Type.STRING },
            instructions: { type: Type.STRING },
          },
          required: ["title", "ingredients", "instructions"],
        },
      },
    });

    const text = response.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error suggesting recipe with AI:", error);
    throw new Error("Failed to generate recipe from AI.");
  }
};

// Fix: Updated to use responseSchema for structured JSON output as per Gemini API guidelines.
export const importRecipeFromImage = async (file: File): Promise<Partial<Recipe>> => {
  try {
    const ai = await getAiClient();
    const imagePart = await fileToGenerativePart(file);
    const textPart = {
      text: `You are a recipe parser. Extract the title, ingredients (as a bulleted list), and instructions (as a numbered list) from this image. If you cannot find one of the fields, return an empty string for it.`
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                ingredients: { type: Type.STRING },
                instructions: { type: Type.STRING },
              },
              required: ["title", "ingredients", "instructions"],
            },
        },
    });
    
    const text = response.text.trim();
    return JSON.parse(text);

  } catch (error) {
    console.error("Error importing recipe from image:", error);
    throw new Error("Failed to parse recipe from image.");
  }
};

// Fix: Updated to use responseSchema for structured JSON output as per Gemini API guidelines.
export const categorizeShoppingList = async (ingredients: string[]): Promise<Record<string, string[]>> => {
    try {
        const ai = await getAiClient();
        const prompt = `Categorize this shopping list into the following groups: Produce, Dairy, Meat, Pantry, and Other. If an item doesn't fit, put it in 'Other'. \n\n${ingredients.join('\n')}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  Produce: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Dairy: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Meat: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Pantry: { type: Type.ARRAY, items: { type: Type.STRING } },
                  Other: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
              },
            },
        });
        
        const text = response.text.trim();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error categorizing shopping list:", error);
        throw new Error("Failed to categorize shopping list.");
    }
};