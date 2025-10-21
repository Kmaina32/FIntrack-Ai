"use server";

import { categorizeTransaction, CategorizeTransactionInput } from "@/ai/flows/ai-categorize-transactions";
import { aiQueryFinancialData, AIQueryFinancialDataInput } from "@/ai/flows/ai-query-financial-data";
import { revalidatePath } from "next/cache";

export async function handleCategorizeTransaction(
  input: CategorizeTransactionInput
) {
  try {
    const result = await categorizeTransaction(input);
    // In a real app, you would update the transaction in the database here.
    // For now, we just revalidate the path to show the change if we were using a real DB.
    revalidatePath("/transactions");
    return result;
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    return { error: "Failed to categorize transaction." };
  }
}

export async function handleAiQuery(
  input: AIQueryFinancialDataInput
) {
  try {
    const result = await aiQueryFinancialData(input);
    return result;
  } catch (error) {
    console.error("Error querying financial data:", error);
    return { answer: "Sorry, I encountered an error while processing your request." };
  }
}
