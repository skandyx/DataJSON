'use server';

import { z } from 'zod';
import { contextualizeStream } from '@/ai/flows/contextualize-stream';

const formSchema = z.object({
  streamUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  metadata: z.string().optional(),
});

export async function handleStreamData(values: z.infer<typeof formSchema>) {
  try {
    const validatedFields = formSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: 'Invalid input.' };
    }

    // In a real application, you would fetch data from validatedFields.data.streamUrl.
    // For this example, we'll simulate the stream data.
    const streamData = JSON.stringify({
      timestamp: new Date().toISOString(),
      value: Math.random() * 100,
      source: validatedFields.data.streamUrl,
    });
    
    const result = await contextualizeStream({
      streamData: streamData,
      metadata: validatedFields.data.metadata,
    });

    return { success: result.contextualizedJson };
  } catch (error) {
    console.error('Error in handleStreamData:', error);
    return { error: 'Failed to process stream. Please try again.' };
  }
}
