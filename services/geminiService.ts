import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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

export const askResearchAssistant = async (question: string): Promise<{ answer: string; sources: any[] }> => {
  try {
    const systemInstruction = `You are a research assistant for parents, specializing in baby-led weaning and infant nutrition. Your answers must be based on information from peer-reviewed journals, scientific studies, and meta-analyses found via Google Search.
Synthesize the findings into a clear, easy-to-understand answer for a non-scientific audience.
Cite sources in the text using bracketed numbers, like [1], corresponding to the order of the sources found.
If you absolutely must use a source that is not a peer-reviewed study (like a reputable health organization's website), you MUST explicitly flag it in the text, for example: ...according to the World Health Organization (source not peer-reviewed) [2].
The final response should be in Markdown format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: systemInstruction,
        tools: [{googleSearch: {}}],
      },
    });

    const answer = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    return { answer, sources };

  } catch (error) {
    console.error("Error asking research assistant:", error);
    throw new Error("Failed to get an answer from the research assistant.");
  }
};