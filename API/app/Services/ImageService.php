<?php

namespace App\Services;

use App\Models\Image;
use App\Repositories\ImageRepository;
use Illuminate\Http\UploadedFile;

class ImageService
{
    public function __construct(
        private ImageRepository $imageRepository
    ) {}

    /**
     * Upload and store an image
     */
    public function uploadImage(int $userId, UploadedFile $file): Image
    {
        // Business logic: Could add image validation, resizing, etc.
        // For now, just delegate to repository
        return $this->imageRepository->create($userId, $file);
    }

    /**
     * Get an image by ID
     */
    public function getImage(int $id): ?Image
    {
        return $this->imageRepository->find($id);
    }

    /**
     * Soft delete an image (marks as deleted in DB, doesn't delete file)
     */
    public function deleteImage(Image $image): bool
    {
        return $this->imageRepository->softDelete($image);
    }

    /**
     * Get all images for a user
     */
    public function getUserImages(int $userId)
    {
        return $this->imageRepository->getAllForUser($userId);
    }
}
