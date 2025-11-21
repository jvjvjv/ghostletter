<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    /**
     * Upload an image and return the URL
     */
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // Max 10MB
        ]);

        $image = $request->file('image');
        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();

        // Store in public disk under 'images' folder
        $path = $image->storeAs('images', $filename, 'public');

        $url = Storage::url($path);

        return response()->json([
            'url' => $url,
            'full_url' => asset($url),
            'path' => $path,
        ], 201);
    }
}
