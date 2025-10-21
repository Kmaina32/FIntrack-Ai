
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
do_not_use:
- docs/backend.json
- src/app/(dashboard)/team/page.tsx
- src/components/team/add-member-sheet.tsx
- src/components/team/team-table.tsx
- src/lib/types.ts