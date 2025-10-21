'use server';

/**
 * @fileOverview An AI assistant for querying financial data and reports.
 *
 * - aiQueryFinancialData - A function that handles financial data queries.
 * - AIQueryFinancialDataInput - The input type for the aiQueryFinancialData function.
 * - AIQueryFinancialDataOutput - The return type for the aiQueryFinancialData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIQueryFinancialDataInputSchema = z.object({
  query: z.string().describe('The user query about their financial data.'),
  financialData: z.string().optional().describe('Relevant financial data for answering the query.'),
});
export type AIQueryFinancialDataInput = z.infer<typeof AIQueryFinancialDataInputSchema>;

const AIQueryFinancialDataOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query based on the financial data.'),
});
export type AIQueryFinancialDataOutput = z.infer<typeof AIQueryFinancialDataOutputSchema>;

export async function aiQueryFinancialData(input: AIQueryFinancialDataInput): Promise<AIQueryFinancialDataOutput> {
  return aiQueryFinancialDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiQueryFinancialDataPrompt',
  input: {schema: AIQueryFinancialDataInputSchema},
  output: {schema: AIQueryFinancialDataOutputSchema},
  prompt: `You are an AI assistant helping users understand their financial data.

  You have access to the following financial data:
  {{#if financialData}}
  {{{financialData}}}
  {{else}}
  The user has not provided any financial data for you to analyze.
  {{/if}}

  Answer the following question:
  {{query}}`,
});

const aiQueryFinancialDataFlow = ai.defineFlow(
  {
    name: 'aiQueryFinancialDataFlow',
    inputSchema: AIQueryFinancialDataInputSchema,
    outputSchema: AIQueryFinancialDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
