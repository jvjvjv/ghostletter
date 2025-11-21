<?php

namespace App\Services;

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
    public function uploadImage(UploadedFile $image): array
    {
        // Business logic: Validate image dimensions, perform processing, etc.
        // For now, just delegate to repository
        return $this->imageRepository->store($image);
    }

    /**
     * Delete an image
     */
    public function deleteImage(string $path): bool
    {
        return $this->imageRepository->delete($path);
    }
}
