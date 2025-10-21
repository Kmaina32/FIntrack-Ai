
'use server';
/**
 * @fileOverview A financial assistant AI agent that can use tools to answer questions.
 */

import { ai } from '@/ai/genkit';
import { db } from '@/lib/firebase-admin';
import { z } from 'genkit';

// Define schemas for tool inputs and outputs
const TransactionFilterSchema = z.object({
  limit: z.number().optional().describe('The maximum number of transactions to return.'),
  startDate: z.string().optional().describe('The start date for filtering transactions (YYYY-MM-DD).'),
  endDate: z.string().optional().describe('The end date for filtering transactions (YYYY-MM-DD).'),
  category: z.string().optional().describe('Filter transactions by a specific category/account.'),
});

// Define tools for the AI to use
const getTransactions = ai.defineTool(
  {
    name: 'getTransactions',
    description: 'Retrieves a list of financial transactions.',
    inputSchema: TransactionFilterSchema,
    outputSchema: z.array(z.any()),
  },
  async (input, context) => {
    if (!context?.auth?.userId) {
        throw new Error('User not authenticated');
    }
    let query: FirebaseFirestore.Query = db.collection('users').doc(context.auth.userId).collection('transactions');

    if (input.startDate) {
        query = query.where('date', '>=', new Date(input.startDate));
    }
    if (input.endDate) {
        query = query.where('date', '<=', new Date(input.endDate));
    }
    if (input.category) {
        query = query.where('account', '==', input.category);
    }
    if (input.limit) {
        query = query.limit(input.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
);

const getAccounts = ai.defineTool(
  {
    name: 'getAccounts',
    description: 'Retrieves the list of accounts from the chart of accounts.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async (input, context) => {
    if (!context?.auth?.userId) {
        throw new Error('User not authenticated');
    }
    const snapshot = await db.collection('users').doc(context.auth.userId).collection('accounts').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
);

const getCustomers = ai.defineTool(
  {
    name: 'getCustomers',
    description: 'Retrieves the list of customers.',
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  async (input, context) => {
    if (!context?.auth?.userId) {
        throw new Error('User not authenticated');
    }
    const snapshot = await db.collection('users').doc(context.auth.userId).collection('customers').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
);


// Define the main financial assistant prompt and flow
export const FinancialAssistantInputSchema = z.object({
  query: z.string().describe('The user query about their financial data.'),
  userId: z.string().describe('The ID of the user.'),
});
export type FinancialAssistantInput = z.infer<typeof FinancialAssistantInputSchema>;

export const FinancialAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query based on the financial data.'),
});
export type FinancialAssistantOutput = z.infer<typeof FinancialAssistantOutputSchema>;

export async function financialAssistant(
  input: FinancialAssistantInput
): Promise<FinancialAssistantOutput> {
  return financialAssistantFlow(input);
}

const financialAssistantPrompt = ai.definePrompt({
  name: 'financialAssistantPrompt',
  system: `You are an expert financial assistant.
  You have access to a set of tools to retrieve the user's financial data.
  Use the tools to answer the user's questions accurately and concisely.
  When presenting data like transactions, format it in a clear, human-readable way.
  If you don't have enough information, ask clarifying questions.`,
  tools: [getTransactions, getAccounts, getCustomers],
  output: { schema: FinancialAssistantOutputSchema },
});

const financialAssistantFlow = ai.defineFlow(
  {
    name: 'financialAssistantFlow',
    inputSchema: FinancialAssistantInputSchema,
    outputSchema: FinancialAssistantOutputSchema,
  },
  async input => {
    const { output } = await financialAssistantPrompt(
      { query: input.query },
      { auth: { userId: input.userId, authenticated: true } }
    );
    return output!;
  }
);
