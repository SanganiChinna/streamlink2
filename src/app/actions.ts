"use server";

import { generateVideoDescription, type GenerateVideoDescriptionInput } from "@/ai/flows/generate-video-descriptions";
import { searchVideos, type VideoSearchInput } from "@/ai/flows/video-search";
import type { Video } from "@/lib/types";

export async function generateVideoDetailsAction(fileId: string, originalLink: string): Promise<Omit<Video, 'createdAt'>> {
  try {
    // For the AI, we'll use a generic title based on the fileId.
    // In a real app, you might try to get a filename or let user input title.
    const genericTitle = `Video: ${fileId}`;
    
    const descriptionInput: GenerateVideoDescriptionInput = {
      videoTitle: genericTitle,
    };
    const descriptionOutput = await generateVideoDescription(descriptionInput);

    return {
      id: fileId,
      googleDriveFileId: fileId,
      title: genericTitle, // Use the generic title for now
      description: descriptionOutput.description,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}`,
      originalLink: originalLink,
    };
  } catch (error) {
    console.error("Error generating video details:", error);
    // Fallback if AI fails
    return {
      id: fileId,
      googleDriveFileId: fileId,
      title: `Video: ${fileId}`,
      description: "No description available.",
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}`,
      originalLink: originalLink,
    };
  }
}

export async function searchLibraryVideosAction(query: string, videos: Video[]): Promise<string[]> {
  if (!query.trim()) {
    return videos.map(v => v.title); // Return all titles if query is empty
  }

  try {
    const videoTitles = videos.map(v => v.title);
    const videoDescriptions = videos.map(v => v.description);

    const searchInput: VideoSearchInput = {
      query,
      videoTitles,
      videoDescriptions,
    };
    const searchOutput = await searchVideos(searchInput);
    return searchOutput; // This is an array of matching video titles
  } catch (error) {
    console.error("Error searching videos:", error);
    // Fallback: simple text search if AI fails
    const lowerQuery = query.toLowerCase();
    return videos
      .filter(v => v.title.toLowerCase().includes(lowerQuery) || v.description.toLowerCase().includes(lowerQuery))
      .map(v => v.title);
  }
}
