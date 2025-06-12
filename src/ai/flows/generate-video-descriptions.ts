'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate video descriptions automatically.
 *
 * - generateVideoDescription - A function that generates a video description based on the video title.
 * - GenerateVideoDescriptionInput - The input type for the generateVideoDescription function.
 * - GenerateVideoDescriptionOutput - The return type for the generateVideoDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoDescriptionInputSchema = z.object({
  videoTitle: z.string().describe('The title of the video.'),
});
export type GenerateVideoDescriptionInput = z.infer<
  typeof GenerateVideoDescriptionInputSchema
>;

const GenerateVideoDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated description of the video.'),
});
export type GenerateVideoDescriptionOutput = z.infer<
  typeof GenerateVideoDescriptionOutputSchema
>;

export async function generateVideoDescription(
  input: GenerateVideoDescriptionInput
): Promise<GenerateVideoDescriptionOutput> {
  return generateVideoDescriptionFlow(input);
}

const generateVideoDescriptionPrompt = ai.definePrompt({
  name: 'generateVideoDescriptionPrompt',
  input: {schema: GenerateVideoDescriptionInputSchema},
  output: {schema: GenerateVideoDescriptionOutputSchema},
  prompt: `You are an expert at writing engaging and informative video descriptions.

  Based on the title of the video, generate a concise description that accurately reflects the video's content and entices viewers to watch it.

  Video Title: {{{videoTitle}}}
  `,
});

const generateVideoDescriptionFlow = ai.defineFlow(
  {
    name: 'generateVideoDescriptionFlow',
    inputSchema: GenerateVideoDescriptionInputSchema,
    outputSchema: GenerateVideoDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateVideoDescriptionPrompt(input);
    return output!;
  }
);
