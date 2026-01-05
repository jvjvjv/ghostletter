<?php

namespace Database\Seeders;

use App\Models\Image;
use App\Models\User;
use Illuminate\Database\Seeder;

class ImageSeeder extends Seeder {
    public function run(): void {
        $dick = User::where('name', 'Dick Mitwin')->first();
        if (!$dick) {
            print_r(User::all());
            throw new \Exception("Dick not found!");
        }

        $directory = storage_path('app/public/images');
        $files = glob($directory . '/*.jpg');
        $images = [];

        foreach ($files as $file) {
            $filename = basename($file);
            $size = filesize($file);
            [$width, $height] = getimagesize($file);

            $images[] = [
                "filename" => $filename,
                "width" => $width,
                "height" => $height,
                "size" => $size,
            ];
        }

        foreach ($images as $img) {
            Image::create([
                'user_id' => $dick->id,
                'path' => 'public/images/' . $img['filename'],
                'url' => '/storage/images/' . $img['filename'],
                'filename' => $img['filename'],
                'mime_type' => 'image/jpeg',
                'size' => $img['size'],
                'width' => $img['width'],
                'height' => $img['height'],
            ]);
        }
    }
}
