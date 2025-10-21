
'use server';
/**
 * @fileOverview An AI flow for analyzing receipt images and extracting transaction data.
 *
 * - analyzeReceipt - A function that handles the receipt analysis process.
 * - AnalyzeReceiptInput - The input type for the analyzeReceipt function.
 * - AnalyzeReceiptOutput - The return type for the analyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeReceiptInput = z.infer<typeof AnalyzeReceiptInputSchema>;

export const AnalyzeReceiptOutputSchema = z.object({
  vendorName: z.string().describe("The name of the vendor or store from the receipt."),
  transactionDate: z
    .string()
    .describe('The date of the transaction in YYYY-MM-DD format.'),
  description: z
    .string()
    .describe('A short description of the items purchased.'),
  totalAmount: z.number().describe('The total amount of the transaction.'),
});
export type AnalyzeReceiptOutput = z.infer<typeof AnalyzeReceiptOutputSchema>;

export async function analyzeReceipt(
  input: AnalyzeReceiptInput
): Promise<AnalyzeReceiptOutput> {
  return analyzeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReceiptPrompt',
  input: {schema: AnalyzeReceiptInputSchema},
  output: {schema: AnalyzeReceiptOutputSchema},
  prompt: `You are an expert at analyzing receipt images and extracting structured data.

  Analyze the following receipt image and extract the vendor's name, the date of the transaction, a brief description of what was purchased, and the total amount.

  Receipt Image: {{media url=receiptImage}}
  
  Ensure the output is valid JSON.`,
});

const analyzeReceiptFlow = ai.defineFlow(
  {
    name: 'analyzeReceiptFlow',
    inputSchema: AnalyzeReceiptInputSchema,
    outputSchema: AnalyzeReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
