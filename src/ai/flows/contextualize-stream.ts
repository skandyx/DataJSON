'use server';

/**
 * @fileOverview Contextualizes a data stream using GenAI by incorporating metadata into the JSON output.
 *
 * - contextualizeStream - A function that handles the contextualization process.
 * - ContextualizeStreamInput - The input type for the contextualizeStream function.
 * - ContextualizeStreamOutput - The return type for the contextualizeStream function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContextualizeStreamInputSchema = z.object({
  streamData: z.string().describe('The data from the stream.'),
  metadata: z.string().optional().describe('Optional metadata associated with the stream (e.g., labels, descriptions).'),
});
export type ContextualizeStreamInput = z.infer<typeof ContextualizeStreamInputSchema>;

const ContextualizeStreamOutputSchema = z.object({
  contextualizedJson: z.string().describe('The JSON data with incorporated metadata for context.'),
});
export type ContextualizeStreamOutput = z.infer<typeof ContextualizeStreamOutputSchema>;

export async function contextualizeStream(input: ContextualizeStreamInput): Promise<ContextualizeStreamOutput> {
  return contextualizeStreamFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualizeStreamPrompt',
  input: {schema: ContextualizeStreamInputSchema},
  output: {schema: ContextualizeStreamOutputSchema},
  prompt: `You are an AI assistant that contextualizes data stream by incorporating metadata.

  You will receive stream data and optional metadata. Your task is to create a JSON object that includes the data and intelligently incorporates the metadata to maintain the context of the data.

  Stream Data: {{{streamData}}}
  Metadata: {{{metadata}}}

  Return a valid JSON object that combines the stream data and metadata in a meaningful way.
  If there is no metadata, return a JSON with a \"data\" field containing the stream data.
  `,
});

const contextualizeStreamFlow = ai.defineFlow(
  {
    name: 'contextualizeStreamFlow',
    inputSchema: ContextualizeStreamInputSchema,
    outputSchema: ContextualizeStreamOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
