import type { ApiImage } from "@/types/api";

import { apiClient } from "./client";

export interface UploadImageResponse {
  id: number;
  url: string;
  filename: string;
  size: number | null;
  width: number | null;
  height: number | null;
}

/**
 * Upload an image file
 * @param file - The image file to upload
 * @returns Object with image ID and URL
 */
export async function uploadImage(file: File): Promise<UploadImageResponse> {
  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    throw new Error("Image size must be less than 10MB");
  }

  // Create FormData
  const formData = new FormData();
  formData.append("image", file);

  // Upload using the upload method (handles multipart/form-data)
  const apiImage = await apiClient.upload<ApiImage>("/images/upload", formData);

  return {
    id: apiImage.id,
    url: apiImage.url,
    filename: apiImage.filename,
    size: apiImage.size,
    width: apiImage.width,
    height: apiImage.height,
  };
}
