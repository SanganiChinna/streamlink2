// src/ai/flows/video-search.ts
'use server';
/**
 * @fileOverview A video search AI agent.
 *
 * - searchVideos - A function that handles the video search process.
 * - VideoSearchInput - The input type for the searchVideos function.
 * - VideoSearchOutput - The return type for the searchVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
  videoTitles: z.array(z.string()).describe('An array of video titles to search through.'),
  videoDescriptions: z.array(z.string()).describe('An array of video descriptions corresponding to the video titles.'),
});
export type VideoSearchInput = z.infer<typeof VideoSearchInputSchema>;

const VideoSearchOutputSchema = z.array(z.string()).describe('An array of video titles that match the search query.');
export type VideoSearchOutput = z.infer<typeof VideoSearchOutputSchema>;

export async function searchVideos(input: VideoSearchInput): Promise<VideoSearchOutput> {
  return searchVideosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'videoSearchPrompt',
  input: {schema: VideoSearchInputSchema},
  output: {schema: VideoSearchOutputSchema},
  prompt: `You are a video search assistant. Given a search query and a list of video titles and descriptions, you will return a list of video titles that match the search query, even if the keywords don't exactly match.

Search Query: {{{query}}}

Video Titles: {{#each videoTitles}}{{{this}}}, {{/each}}

Video Descriptions: {{#each videoDescriptions}}{{{this}}}, {{/each}}

Return only the video titles that are a good match for the search query. Do not include any other text in your response.`,
});

const searchVideosFlow = ai.defineFlow(
  {
    name: 'searchVideosFlow',
    inputSchema: VideoSearchInputSchema,
    outputSchema: VideoSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
