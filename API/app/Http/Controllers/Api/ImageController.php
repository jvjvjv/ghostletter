<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    public function __construct(
        private ImageService $imageService
    ) {}

    /**
     * Upload an image and return the URL
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:10240', // Max 10MB
        ]);

        $imageData = $this->imageService->uploadImage($request->file('image'));

        return response()->json($imageData, 201);
    }
}
