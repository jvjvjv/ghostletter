<?php

namespace App\Repositories;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageRepository
{
    /**
     * Store an uploaded image
     */
    public function store(UploadedFile $image): array
    {
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
        $path = $image->storeAs('images', $filename, 'public');
        $url = Storage::url($path);

        return [
            'url' => $url,
            'full_url' => asset($url),
            'path' => $path,
        ];
    }

    /**
     * Delete an image by path
     */
    public function delete(string $path): bool
    {
        return Storage::disk('public')->delete($path);
    }
}
