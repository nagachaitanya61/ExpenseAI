// Fix: Implement Gemini API services for receipt processing and insight generation.
import { GoogleGenAI, Type } from "@google/genai";
import type { Expense, ExtractedItem, SavingsGoal } from "../types";
import type { Budgets } from "../contexts/BudgetContext";
import type { Currency } from "../utils/currencies";

// Fix: Initialize the GoogleGenAI client. The API key must be read from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const extractExpensesFromReceipt = async (file: File, categories: string[]): Promise<ExtractedItem[]> => {
  const imagePart = await fileToGenerativePart(file);

  const textPart = {
    text: `Extract the itemized list of expenses from this receipt. For each item, provide its name, price, and category. Use the following categories: ${categories.join(', ')}. If an item doesn't fit any category, use "Other". The price should be a number.
    
    Example response format:
    [
        {"name": "Organic Bananas", "category": "Groceries", "price": 1.29},
        {"name": "Almond Milk", "category": "Groceries", "price": 3.49}
    ]
    `
  };

  try {
    // Fix: Use the correct model 'gemini-2.5-flash' and API structure.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The name of the purchased item.",
              },
              category: {
                type: Type.STRING,
                description: `The category of the item. Must be one of: ${categories.join(', ')}`,
              },
              price: {
                type: Type.NUMBER,
                description: "The price of the item as a number.",
              },
            },
            required: ["name", "category", "price"],
          },
        },
      },
    });

    // Fix: Extract the text response correctly.
    const jsonString = response.text.trim();
    
    if (!jsonString) {
        throw new Error("The AI returned an empty response. The receipt might be unclear.");
    }

    // Sometimes the model returns the JSON wrapped in ```json ... ```
    const cleanedJsonString = jsonString.replace(/^```json\s*|\s*```$/g, '');
    const data = JSON.parse(cleanedJsonString);

    if (!Array.isArray(data)) {
      throw new Error("The AI response was not in the expected format (array).");
    }

    // Validate that the returned categories are valid
    return data.map(item => ({
      ...item,
      category: categories.includes(item.category) ? item.category : 'Other'
    }));
  } catch (error) {
    console.error("Error processing receipt with Gemini API:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The AI returned an invalid response. Please try a clearer receipt image.");
    }
    throw new Error("Failed to analyze the receipt. The image might be blurry or the format unsupported.");
  }
};

export const generateInsights = async (expenses: Expense[], currency: Currency): Promise<string> => {
  if (expenses.length === 0) {
    return "There are no expenses to analyze.";
  }

  const prompt = `
    You are a financial analyst AI. Here is a list of recent expenses in ${currency.name} (${currency.code}):
    ${JSON.stringify(expenses, null, 2)}

    Analyze these spending habits and provide a brief, insightful summary (2-3 sentences). 
    - Highlight the category with the highest spending.
    - Mention any potential areas for savings.
    - Keep the tone encouraging and helpful.
    - Use Markdown for formatting, for example, use **bold** for key terms.
  `;
  
  try {
    // Fix: Use the correct model 'gemini-2.5-flash' and API structure for generating text content.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    // Fix: Extract the text response correctly.
    return response.text;
  } catch (error) {
    console.error("Error generating insights with Gemini API:", error);
    throw new Error("Failed to generate financial insights at this time.");
  }
};

export const generateBudgetSuggestions = async (
  expenses: Expense[], 
  categories: string[], 
  currency: Currency
): Promise<Record<string, number>> => {
  if (expenses.length < 5) {
    throw new Error("Not enough expense data to generate suggestions. Please add more expenses.");
  }
  
  const prompt = `
    You are an expert financial advisor AI. Based on the following list of recent expenses in ${currency.name} (${currency.code}), please suggest a reasonable monthly budget for each category.
    The goal is to help the user save money while maintaining a realistic lifestyle. 
    Only provide suggestions for the following categories: ${categories.join(', ')}.
    
    Expense Data:
    ${JSON.stringify(expenses.map(({ name, category, price, date }) => ({ name, category, price, date })))}

    Please provide your response as a JSON array of objects, where each object has a "category" and a "budget" field. The budget should be a positive number.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: `One of the provided categories: ${categories.join(', ')}`,
              },
              budget: {
                type: Type.NUMBER,
                description: "A reasonable monthly budget amount for this category.",
              },
            },
            required: ["category", "budget"],
          },
        },
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error("The AI returned an empty response.");
    }

    const cleanedJsonString = jsonString.replace(/^```json\s*|\s*```$/g, '');
    const data: { category: string; budget: number }[] = JSON.parse(cleanedJsonString);
    
    if (!Array.isArray(data)) {
      throw new Error("The AI response was not in the expected array format.");
    }
    
    const suggestions: Record<string, number> = {};
    data.forEach(item => {
      if (categories.includes(item.category) && typeof item.budget === 'number' && item.budget >= 0) {
        suggestions[item.category] = Math.round(item.budget);
      }
    });

    return suggestions;

  } catch (error) {
    console.error("Error generating budget suggestions with Gemini API:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    throw new Error("Failed to generate budget suggestions at this time.");
  }
};

export const generateCoachingMessage = async (
  goal: SavingsGoal,
  expenses: Expense[],
  budgets: Budgets,
  currency: Currency
): Promise<string> => {
   if (expenses.length === 0) {
    return "Start by adding some expenses so I can help you with your goal!";
  }

  const prompt = `
    You are an AI savings coach. Your tone should be encouraging, insightful, and positive.
    The user has the following savings goal:
    - Goal: Save for a "${goal.name}"
    - Target Amount: ${currency.symbol}${goal.targetAmount}
    - Amount Saved So Far: ${currency.symbol}${goal.savedAmount}
    - Deadline: ${goal.deadline}

    Here is their spending and budget data for the current month in ${currency.name} (${currency.code}):
    - Budgets: ${JSON.stringify(budgets)}
    - Recent Expenses: ${JSON.stringify(expenses.slice(0, 20), null, 2)} // Last 20 for brevity

    Based on this, provide a short (2-3 sentences) coaching message. Your message should:
    1. Acknowledge their goal in a positive way.
    2. Provide ONE specific, actionable tip based on their recent spending and budgets. For example, if they are close to their 'Shopping' budget, suggest a specific way they could cut back that's related to their goal.
    3. End with an encouraging statement to keep them motivated.
    4. Use Markdown for formatting, like using **bold** for key terms.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating coaching message with Gemini API:", error);
    throw new Error("Failed to generate a coaching message at this time.");
  }
};
