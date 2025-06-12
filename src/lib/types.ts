export interface Video {
  id: string; // Google Drive File ID
  title: string;
  description: string;
  thumbnailUrl: string;
  googleDriveFileId: string; 
  originalLink: string;
  createdAt: number; // Timestamp for sorting or tracking
}
