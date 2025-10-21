
'use server';
/**
 * @fileOverview An AI assistant for providing information on Kenyan tax policies.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const getKenyanTaxInfo = ai.defineTool(
  {
    name: 'getKenyanTaxInfo',
    description: 'Provides information about specific Kenyan tax laws and regulations when a user asks a question about them.',
    inputSchema: z.object({
        topic: z.string().describe('The specific tax topic the user is asking about (e.g., "VAT", "Income Tax", "Withholding Tax").'),
    }),
    outputSchema: z.string(),
  },
  async ({topic}) => {
    // In a real application, this would query a database or a specialized API.
    // For this prototype, I will provide some sample static information.
    const taxData: Record<string, string> = {
        'vat': "Value Added Tax (VAT) in Kenya is currently 16%. It is applicable on most goods and services. Businesses with a turnover of KES 5 million or more are required to register for VAT.",
        'income tax': "Corporate income tax for resident companies is 30%. For individual residents, income tax is on a graduated scale from 10% to 30%. Non-resident companies pay 37.5%.",
        'withholding tax': "Withholding tax rates in Kenya vary depending on the nature of the payment. For example, the rate for dividends paid to residents is 5%, while for royalties it is 5%. For professional fees paid to residents, the rate is 5%.",
    };
    
    const lowerCaseTopic = topic.toLowerCase();
    
    if (taxData[lowerCaseTopic]) {
      return taxData[lowerCaseTopic];
    }

    for (const key in taxData) {
        if (lowerCaseTopic.includes(key)) {
            return taxData[key];
        }
    }

    return "I do not have specific information on that Kenyan tax topic. Please ask about VAT, Income Tax, or Withholding Tax for details.";
  }
);


export const KenyanTaxAdvisorInputSchema = z.object({
  query: z.string().describe('The user query about Kenyan tax policies.'),
});
export type KenyanTaxAdvisorInput = z.infer<typeof KenyanTaxAdvisorInputSchema>;

export const KenyanTaxAdvisorOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query based on Kenyan tax information.'),
});
export type KenyanTaxAdvisorOutput = z.infer<typeof KenyanTaxAdvisorOutputSchema>;

export async function kenyanTaxAdvisor(
  input: KenyanTaxAdvisorInput
): Promise<KenyanTaxAdvisorOutput> {
  return kenyanTaxAdvisorFlow(input);
}


const prompt = ai.definePrompt({
    name: 'kenyanTaxAdvisorPrompt',
    system: `You are an expert on Kenyan tax law. 
    Use the available tools to answer the user's question. 
    If the tool does not provide a specific answer, say that you don't have information on that topic.
    Do not make up answers.`,
    tools: [getKenyanTaxInfo],
    output: {
        schema: KenyanTaxAdvisorOutputSchema
    }
});


const kenyanTaxAdvisorFlow = ai.defineFlow(
  {
    name: 'kenyanTaxAdvisorFlow',
    inputSchema: KenyanTaxAdvisorInputSchema,
    outputSchema: KenyanTaxAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(
      { query: input.query }
    );
    return output!;
  }
);
