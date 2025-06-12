
"use server";

import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, limit, deleteDoc, orderBy, Timestamp } from "firebase/firestore";
import type { Video } from "@/lib/types";
import { extractGoogleDriveFileId } from "@/lib/utils";

interface AddVideoData {
  googleDriveLink: string;
  title: string;
  description: string;
}

export async function addVideoToLibraryAction(
  data: AddVideoData
): Promise<{ success: boolean; videoId?: string; error?: string; message?: string }> {
  const { googleDriveLink, title, description } = data;

  const fileId = extractGoogleDriveFileId(googleDriveLink);

  if (!fileId) {
    return { success: false, error: "Invalid Google Drive link format." };
  }

  try {
    const videosCollectionRef = collection(db, "videos");
    const q = query(videosCollectionRef, where("googleDriveFileId", "==", fileId), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: false, message: "This video already exists in the library.", videoId: querySnapshot.docs[0].id };
    }

    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;

    // createdAt will be handled by serverTimestamp during setDoc
    const newVideoData: Omit<Video, "createdAt" | "id"> = { 
      googleDriveFileId: fileId,
      title,
      description,
      thumbnailUrl,
      originalLink: googleDriveLink,
    };

    const videoDocRef = doc(db, "videos", fileId);
    await setDoc(videoDocRef, {
      ...newVideoData,
      id: fileId, 
      createdAt: serverTimestamp(), // Firestore handles this server-side
    });

    return { success: true, videoId: fileId, message: `Video "${title}" added successfully.` };
  } catch (error) {
    console.error("Error adding video to Firestore:", error);
    let errorMessage = "Failed to add video.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function deleteVideoAction(videoId: string): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!videoId) {
    return { success: false, error: "Video ID is required." };
  }
  try {
    const videoDocRef = doc(db, "videos", videoId);
    await deleteDoc(videoDocRef);
    return { success: true, message: "Video deleted successfully." };
  } catch (error) {
    console.error("Error deleting video from Firestore:", error);
    let errorMessage = "Failed to delete video.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function getVideosAction(): Promise<{ videos: Video[]; error?: string }> {
  try {
    const videosCollectionRef = collection(db, "videos");
    const q = query(videosCollectionRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const videosData = querySnapshot.docs.map(docInstance => {
      const data = docInstance.data();
      let createdAtString: string;

      if (data.createdAt instanceof Timestamp) {
        createdAtString = data.createdAt.toDate().toISOString();
      } else if (data.createdAt && typeof data.createdAt.seconds === 'number' && typeof data.createdAt.nanoseconds === 'number') {
        createdAtString = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds).toDate().toISOString();
      } else if (typeof data.createdAt === 'string') {
        try {
          createdAtString = new Date(data.createdAt).toISOString();
        } catch (e) {
          console.warn(`Invalid date string for createdAt: ${data.createdAt} on video ${docInstance.id}. Falling back.`);
          createdAtString = new Date().toISOString();
        }
      } else {
        console.warn(`Missing or invalid createdAt for video ${docInstance.id}. Falling back to current time.`);
        createdAtString = new Date().toISOString();
      }
      
      return {
        id: docInstance.id,
        title: data.title || 'Untitled Video',
        description: data.description || 'No description available.',
        thumbnailUrl: data.thumbnailUrl || '',
        googleDriveFileId: data.googleDriveFileId || '',
        originalLink: data.originalLink || '',
        createdAt: createdAtString,
      } as Video;
    });
    return { videos: videosData };
  } catch (error) {
    console.error("Error fetching videos from Firestore:", error);
    return { videos: [], error: "Failed to fetch videos." };
  }
}
