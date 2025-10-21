
'use server';

import { categorizeTransaction, CategorizeTransactionInput } from "@/ai/flows/ai-categorize-transactions";
import { aiQueryFinancialData, AIQueryFinancialDataInput } from "@/ai/flows/ai-query-financial-data";
import { analyzeReceipt, AnalyzeReceiptInput } from "@/ai/flows/ai-analyze-receipt";
import { getFirebaseAdmin } from "./firebase-admin";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { DecodedIdToken } from "firebase-admin/auth";
import type { Invoice, Product, Sale, Transaction } from "./types";
import { FieldValue, writeBatch } from "firebase-admin/firestore";


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
  const idToken = headers().get('Authorization')?.split('Bearer ')[1];
  return getUserId(idToken);
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
            amount: transaction.type === 'Expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
            date: transaction.date ? new Date(transaction.date) : FieldValue.serverTimestamp()
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

    // Safer count method using .get() and .size
    const invoicesSnapshot = await invoiceRef.get();
    const invoiceNumber = `INV-${(invoicesSnapshot.size + 1).toString().padStart(4, '0')}`;

    const newInvoice = {
      ...invoice,
      userId,
      invoiceNumber,
      // Add guards for dates
      issueDate: invoice.issueDate ? new Date(invoice.issueDate) : new Date(),
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
    };

    const docRef = await invoiceRef.add(newInvoice);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating invoice:", error);
    // Return a more structured error for the client
    return { error: "Failed to create invoice on the server." };
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
  const batch = db.batch();

  try {
    // 1. Create a transaction for the sale income
    const transaction: Omit<Transaction, 'id'> = {
      description: `POS Sale - ${new Date().toISOString()}`,
      amount: sale.total,
      type: 'Income',
      account: 'Sales Revenue', // Assuming a default account
      date: new Date(),
    };
    const transactionRef = db.collection('users').doc(userId).collection('transactions').doc();
    batch.set(transactionRef, transaction);

    // 2. Decrement stock for each item in the sale
    for (const item of sale.lineItems) {
      const productRef = db.collection('users').doc(userId).collection('products').doc(item.id);
      batch.update(productRef, {
        quantityInStock: FieldValue.increment(-item.quantity)
      });
    }

    // 3. (Optional) Save the sale details
    const saleRef = db.collection('users').doc(userId).collection('sales').doc();
    batch.set(saleRef, { ...sale, userId });
    
    await batch.commit();

    return { success: true, saleId: saleRef.id };
  } catch (error) {
    console.error("Error processing sale:", error);
    throw new Error("Failed to process sale.");
  }
}
