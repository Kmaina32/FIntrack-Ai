'use server';
/**
 * @fileOverview Automatically categorizes transactions from imported bank statements using AI, learning from user feedback to improve accuracy over time.
 *
 * - categorizeTransaction - A function that handles the transaction categorization process.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction from the bank statement.'),
  previousCategories: z
    .array(z.object({description: z.string(), category: z.string()}))
    .optional()
    .describe(
      'A list of previously categorized transactions to help the AI learn.'
    ),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  category: z.string().describe('The predicted category for the transaction.'),
  confidence: z
    .number()
    .describe(
      'A confidence score (0-1) indicating the AI’s certainty in the category assignment.'
    ),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are an AI assistant that categorizes financial transactions.

  Based on the transaction description, you will assign it to a category.

  Here are some example categories: Groceries, Utilities, Rent, Salary, Entertainment.

  Previous categories:
  {{#each previousCategories}}
  Description: {{this.description}}, Category: {{this.category}}
  {{/each}}

  Transaction Description: {{{transactionDescription}}}

  Please provide the category and a confidence score (0-1) for your prediction.
  Ensure the output is valid JSON of the following format:
  {
    "category": "<predicted_category>",
    "confidence": <confidence_score>
  }`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
