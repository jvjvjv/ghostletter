<?php

namespace App\Repositories;

use App\Models\Image;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageRepository
{
    /**
     * Create an image record in the database and store the file
     */
    public function create(int $userId, UploadedFile $file): Image
    {
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Store file in public disk
        $path = $file->storeAs('images', $filename, 'public');
        $url = Storage::url($path);

        // Get image dimensions if it's an image
        $dimensions = $this->getImageDimensions($file);

        // Create database record
        return Image::create([
            'user_id' => $userId,
            'path' => $path,
            'url' => $url,
            'filename' => $filename,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $dimensions['width'] ?? null,
            'height' => $dimensions['height'] ?? null,
        ]);
    }

    /**
     * Find an image by ID
     */
    public function find(int $id): ?Image
    {
        return Image::find($id);
    }

    /**
     * Soft delete an image (don't delete file from disk)
     */
    public function softDelete(Image $image): bool
    {
        return $image->delete();
    }

    /**
     * Get all images for a user
     */
    public function getAllForUser(int $userId)
    {
        return Image::where('user_id', $userId)->get();
    }

    /**
     * Get image dimensions from uploaded file
     */
    private function getImageDimensions(UploadedFile $file): array
    {
        try {
            $imageInfo = getimagesize($file->getRealPath());
            if ($imageInfo !== false) {
                return [
                    'width' => $imageInfo[0],
                    'height' => $imageInfo[1],
                ];
            }
        } catch (\Exception $e) {
            // If we can't get dimensions, just return null
        }

        return ['width' => null, 'height' => null];
    }
}
