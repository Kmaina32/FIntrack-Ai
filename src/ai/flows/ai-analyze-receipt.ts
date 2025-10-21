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
  description: z.string().describe('A short, concise summary of the items purchased. e.g., "Groceries", "Office Supplies".'),
  totalAmount: z
    .number()
    .describe('The final total amount of the transaction.'),
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
  prompt: `You are an expert financial assistant specialized in parsing receipts.

You will be given an image of a receipt. Your task is to extract the following information accurately:
1.  **Vendor Name**: The name of the store or business.
2.  **Transaction Date**: The date the transaction occurred. Return it in YYYY-MM-DD format.
3.  **Description**: Provide a brief, general description of the items. For example, if the receipt contains food items, a good description is "Groceries". If it contains pens and paper, use "Office Supplies".
4.  **Total Amount**: The final amount paid, including any taxes or tips.

Analyze the following receipt image and provide the extracted data in the specified JSON format.

Receipt Image:
{{media url=receiptImage}}
`,
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
