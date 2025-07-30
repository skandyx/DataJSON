
'use server';

import { z } from 'zod';
import { contextualizeStream } from '@/ai/flows/contextualize-stream';

const formSchema = z.object({
  streamData: z.string(),
  metadata: z.string().optional(),
});

export async function handleStreamData(values: z.infer<typeof formSchema>) {
  try {
    const validatedFields = formSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: 'Invalid data received from stream.' };
    }
    
    const result = await contextualizeStream({
      streamData: validatedFields.data.streamData,
      metadata: validatedFields.data.metadata,
    });

    return { success: result.contextualizedJson };
  } catch (error) {
    console.error('Error in handleStreamData:', error);
    return { error: 'Failed to process stream data. Please try again.' };
  }
}
