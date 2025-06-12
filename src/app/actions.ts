
"use server";

import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
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
    // Check if video already exists
    const videosCollectionRef = collection(db, "videos");
    const q = query(videosCollectionRef, where("googleDriveFileId", "==", fileId), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: false, message: "This video already exists in the library.", videoId: querySnapshot.docs[0].id };
    }

    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;

    const newVideoData: Omit<Video, "createdAt"> = {
      id: fileId, // Using googleDriveFileId as the document ID
      googleDriveFileId: fileId,
      title,
      description,
      thumbnailUrl,
      originalLink: googleDriveLink,
    };

    // Use googleDriveFileId as the document ID in Firestore
    const videoDocRef = doc(db, "videos", fileId);
    await setDoc(videoDocRef, {
      ...newVideoData,
      createdAt: serverTimestamp(),
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
