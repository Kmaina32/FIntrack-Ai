'use server';

import { categorizeTransaction, CategorizeTransactionInput } from "@/ai/flows/ai-categorize-transactions";
import { aiQueryFinancialData, AIQueryFinancialDataInput } from "@/ai/flows/ai-query-financial-data";
import { getFirebaseAdmin } from "./firebase-admin";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { DecodedIdToken } from "firebase-admin/auth";
import type { Transaction } from "./types";
import { FieldValue } from "firebase-admin/firestore";


async function getUserId(): Promise<string> {
  const { auth } = getFirebaseAdmin();
  const idToken = headers().get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    throw new Error('User not authenticated');
  }

  try {
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid authentication token.");
  }
}

export async function handleAiCategorize(
  input: CategorizeTransactionInput
) {
  try {
    const result = await categorizeTransaction(input);
    return result;
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    return { error: "Failed to categorize transaction." };
  }
}

export async function handleUpdateTransactionCategory(transactionId: string, category: string) {
  const userId = await getUserId();
  const { db } = getFirebaseAdmin();

  try {
    const transactionRef = db.collection('users').doc(userId).collection('transactions').doc(transactionId);
    await transactionRef.update({ category });
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction category:", error);
    throw new Error("Failed to update transaction category.");
  }
}

export async function handleAddTransaction(transaction: Omit<Transaction, 'id'>) {
    const userId = await getUserId();
    const { db } = getFirebaseAdmin();
    
    try {
        const newTransaction = {
            ...transaction,
            date: FieldValue.serverTimestamp()
        };

        const transactionRef = await db.collection('users').doc(userId).collection('transactions').add(newTransaction);
        revalidatePath('/transactions');
        revalidatePath('/dashboard');
        return { success: true, id: transactionRef.id };
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw new Error("Failed to add transaction.");
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
