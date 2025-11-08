

import { configureGenkit } from '@genkit-ai/core';
import { firebase } from '@genkit-ai/firebase';
import { gemini } from '@genkit-ai/googleai';
import { onFlow } from '@genkit-ai/firebase/functions';
import * as z from 'zod';

// Configure Genkit to use the Firebase plugin for deployment and the Google AI (Gemini) plugin.
// Your API key should be stored as a secret in your Firebase project (e.g., using `firebase functions:secrets:set GEMINI_API_KEY`).
configureGenkit({
  plugins: [
    firebase(),
    gemini({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Zod schemas for strongly-typed inputs and outputs
const RecipeSchema = z.object({
  title: z.string(),
  ingredients: z.string(),
  instructions: z.string(),
});

// 1. A flow for suggesting a recipe from ingredients
export const suggestRecipeFlow = onFlow(
  {
    name: 'suggestRecipeFlow',
    inputSchema: z.string(),
    outputSchema: RecipeSchema,
    authPolicy: (auth, input) => { // Allow any authenticated user (including anonymous)
      if (!auth) {
        throw new Error('Authentication required.');
      }
    },
  },
  async (prompt) => {
    const fullPrompt = `You are a baby-led weaning recipe creator. A parent wants a recipe using the following ingredients: "${prompt}". 
    Create a simple recipe appropriate for a baby 6-12 months old. 
    Make sure ingredients are a bulleted list and instructions are a numbered list.
    Respond with only the JSON object, with keys "title", "ingredients", and "instructions".`;

    const llmResponse = await gemini.generate({
        model: 'gemini-2.5-flash',
        prompt: fullPrompt,
        output: { format: 'json', schema: RecipeSchema },
    });

    let recipeData = llmResponse.output();
    if (!recipeData) {
        throw new Error("Failed to get valid recipe data from AI.");
    }
    
    // Normalize ingredients if they come back as an array (a common AI quirk)
    if (Array.isArray(recipeData.ingredients)) {
        recipeData.ingredients = (recipeData.ingredients as string[]).join('\n');
    }
    
    return recipeData;
  }
);

// 2. A flow for importing a recipe from an image
export const importRecipeFlow = onFlow(
  {
    name: 'importRecipeFlow',
    inputSchema: z.object({
        base64Data: z.string(),
        mimeType: z.string(),
    }),
    outputSchema: RecipeSchema,
    authPolicy: (auth, input) => {
      if (!auth) {
        throw new Error('Authentication required.');
      }
    },
  },
  async ({ base64Data, mimeType }) => {
    const prompt = `You are a recipe parser. Extract the title, ingredients (as a bulleted list), and instructions (as a numbered list) from this image. If you cannot find one of the fields, return an empty string for it. Respond with only the JSON object.`;

    const llmResponse = await gemini.generate({
        model: 'gemini-2.5-flash',
        prompt: prompt,
        input: {
            media: [{
// Fix: Use the base64 string directly. The `Buffer` type is not available in this context, and the Genkit plugin can handle a base64 string.
                data: base64Data,
                contentType: mimeType
            }]
        },
        output: { format: 'json', schema: RecipeSchema },
    });

    let recipeData = llmResponse.output();
    if (!recipeData) {
        throw new Error("Failed to get valid recipe data from image.");
    }

    if (Array.isArray(recipeData.ingredients)) {
        recipeData.ingredients = (recipeData.ingredients as string[]).join('\n');
    }

    return recipeData;
  }
);

// 3. A flow for categorizing a shopping list
export const categorizeListFlow = onFlow(
  {
    name: 'categorizeListFlow',
    inputSchema: z.array(z.string()),
    outputSchema: z.record(z.array(z.string())),
    authPolicy: (auth, input) => {
      if (!auth) {
        throw new Error('Authentication required.');
      }
    },
  },
  async (ingredients) => {
    const prompt = `Categorize this shopping list into the following groups: Produce, Dairy, Meat, Pantry, and Other. If an item doesn't fit, put it in 'Other'. \n\n${ingredients.join('\n')}`;
    
    const llmResponse = await gemini.generate({
        model: 'gemini-2.5-flash',
        prompt: prompt,
        output: {
            format: 'json',
            schema: z.object({
                Produce: z.array(z.string()),
                Dairy: z.array(z.string()),
                Meat: z.array(z.string()),
                Pantry: z.array(z.string()),
                Other: z.array(z.string()),
            })
        },
    });

    const categories = llmResponse.output();
    if (!categories) {
        throw new Error("Failed to get categories from AI.");
    }
    
    return categories;
  }
);
