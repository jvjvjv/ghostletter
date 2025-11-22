<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImageController extends Controller
{
    public function __construct(
        private ImageService $imageService
    ) {}

    /**
     * Upload an image and create database record
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:10240', // Max 10MB
        ]);

        $image = $this->imageService->uploadImage(
            Auth::id(),
            $request->file('image')
        );

        return response()->json($image, 201);
    }
}
