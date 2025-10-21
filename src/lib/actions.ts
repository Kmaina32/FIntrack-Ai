
'use server';

import { categorizeTransaction, CategorizeTransactionInput } from "@/ai/flows/ai-categorize-transactions";
import { financialAssistant, FinancialAssistantInput } from "@/ai/flows/financial-assistant";
import { analyzeReceipt, AnalyzeReceiptInput } from "@/ai/flows/ai-analyze-receipt";
import { getFirebaseAdmin } from "./firebase-admin";
import { headers } from "next/headers";
import { DecodedIdToken } from "firebase-admin/auth";
import type { ChatMessage, Invoice, Product, Sale, Transaction } from "./types";
import { FieldValue, Timestamp, WriteBatch } from "firebase-admin/firestore";


async function getUserId(idToken: string | null | undefined): Promise<string> {
  if (!idToken) {
    throw new Error('User not authenticated, no ID token provided.');
  }
  const { auth } = getFirebaseAdmin();
  try {
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid authentication token.");
  }
}

async function getUserIdFromHeaders(): Promise<string> {
  const heads = await headers();
  const idToken = heads.get('Authorization')?.split('Bearer ')[1];
  return getUserId(idToken);
}

// Helper to convert Firestore Timestamp or string to JS Date
function toDate(dateValue: string | Date | Timestamp): Date {
    if (dateValue instanceof Timestamp) {
        return dateValue.toDate();
    }
    return new Date(dateValue);
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

export async function handleUpdateTransactionCategory(transactionId: string, account: string, idToken: string) {
  const userId = await getUserId(idToken);
  const { db } = getFirebaseAdmin();

  try {
    const transactionRef = db.collection('users').doc(userId).collection('transactions').doc(transactionId);
    await transactionRef.update({ account });
    // The revalidatePath is removed as real-time listeners handle UI updates.
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction account:", error);
    throw new Error("Failed to update transaction account.");
  }
}

export async function handleAddTransaction(transaction: Omit<Transaction, 'id'>, idToken: string) {
    const userId = await getUserId(idToken);
    const { db } = getFirebaseAdmin();
    
    try {
        const newTransaction = {
            ...transaction,
            userId,
            amount: transaction.type === 'Expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
            date: transaction.date ? toDate(transaction.date) : FieldValue.serverTimestamp()
        };

        const transactionRef = await db.collection('users').doc(userId).collection('transactions').add(newTransaction);
        
        return { success: true, id: transactionRef.id };
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw new Error("Failed to add transaction.");
    }
}

export async function handleCreateInvoice(invoice: Omit<Invoice, 'id' | 'userId' | 'invoiceNumber'>, idToken: string) {
  const userId = await getUserId(idToken);
  const { db } = getFirebaseAdmin();

  try {
    const orgRef = db.collection('users').doc(userId);
    const invoiceRef = orgRef.collection('invoices');

    const invoicesSnapshot = await invoiceRef.get();
    const invoiceNumber = `INV-${(invoicesSnapshot.size + 1).toString().padStart(4, '0')}`;

    const newInvoice = {
      ...invoice,
      userId,
      invoiceNumber,
      issueDate: invoice.issueDate ? toDate(invoice.issueDate) : new Date(),
      dueDate: invoice.dueDate ? toDate(invoice.dueDate) : new Date(),
    };

    const docRef = await invoiceRef.add(newInvoice);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { error: "Failed to create invoice on the server." };
  }
}


export async function handleAiQuery(
  input: FinancialAssistantInput
) {
  try {
    const userId = await getUserIdFromHeaders();
    const result = await financialAssistant({ ...input, userId });
    return result;
  } catch (error) {
    console.error("Error querying financial data:", error);
    return { answer: "Sorry, I encountered an error while processing your request." };
  }
}

export async function handleAnalyzeReceipt(
  input: AnalyzeReceiptInput
) {
  try {
    const result = await analyzeReceipt(input);
    return result;
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    return { error: "Failed to analyze receipt." };
  }
}

export async function handleAddProduct(product: Omit<Product, 'id'>, idToken: string) {
  const userId = await getUserId(idToken);
  const { db } = getFirebaseAdmin();

  try {
    const productRef = await db.collection('users').doc(userId).collection('products').add(product);
    return { success: true, id: productRef.id };
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Failed to add product.");
  }
}

export async function handleProcessSale(sale: Omit<Sale, 'id' | 'userId'>, idToken: string) {
  const userId = await getUserId(idToken);
  const { db } = getFirebaseAdmin();
  const batch: WriteBatch = db.batch();

  try {
    const transaction: Omit<Transaction, 'id' | 'bankAccountId'> = {
      description: `POS Sale - ${new Date().toISOString()}`,
      amount: sale.total,
      type: 'Income',
      account: 'Sales Revenue', 
      date: new Date(),
      userId,
    };
    const transactionRef = db.collection('users').doc(userId).collection('transactions').doc();
    batch.set(transactionRef, transaction);

    for (const item of sale.lineItems) {
      const productRef = db.collection('users').doc(userId).collection('products').doc(item.id);
      batch.update(productRef, {
        quantityInStock: FieldValue.increment(-item.quantity)
      });
    }

    const saleRef = db.collection('users').doc(userId).collection('sales').doc();
    batch.set(saleRef, { 
      ...sale, 
      userId,
      date: new Date(),
    });
    
    await batch.commit();

    return { success: true, saleId: saleRef.id };
  } catch (error) {
    console.error("Error processing sale:", error);
    throw new Error("Failed to process sale.");
  }
}

export async function handleAddChatMessage(message: Omit<ChatMessage, 'id' | 'userId' | 'createdAt'>, idToken: string) {
    const userId = await getUserId(idToken);
    const { db } = getFirebaseAdmin();

    try {
        const newMessage = {
            ...message,
            userId,
            createdAt: FieldValue.serverTimestamp(),
        };
        const messageRef = await db.collection('users').doc(userId).collection('chatMessages').add(newMessage);
        return { success: true, id: messageRef.id };
    } catch (error) {
        console.error("Error adding chat message:", error);
        throw new Error("Failed to add chat message.");
    }
}
