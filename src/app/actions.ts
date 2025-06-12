
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

    const newVideoData: Omit<Video, "createdAt" | "id"> = { // id will be same as fileId
      googleDriveFileId: fileId,
      title,
      description,
      thumbnailUrl,
      originalLink: googleDriveLink,
    };

    const videoDocRef = doc(db, "videos", fileId);
    await setDoc(videoDocRef, {
      ...newVideoData,
      id: fileId, // Explicitly set id field in document
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
    const videosData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.fromDate(new Date(data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()));
      return { ...data, id: doc.id, createdAt } as Video;
    });
    return { videos: videosData };
  } catch (error) {
    console.error("Error fetching videos from Firestore:", error);
    return { videos: [], error: "Failed to fetch videos." };
  }
}
