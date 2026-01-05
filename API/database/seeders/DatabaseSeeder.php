<?php

namespace Database\Seeders;

use App\Models\Friend;
use App\Models\Image;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    /**
     * Seed the application's database.
     */
    public function run(): void {
        $this->call([
            UserSeeder::class,
            ImageSeeder::class,
            MessageSeeder::class,
        ]);
    }
}
