
import type { Timestamp } from 'firebase/firestore';

export interface Video {
  id: string; // Firestore document ID, typically same as googleDriveFileId
  title: string;
  description: string;
  thumbnailUrl: string;
  googleDriveFileId: string;
  originalLink: string;
  createdAt: Timestamp;
}
