<?php

namespace App\Listeners;

use App\Models\Image;
use App\Models\Message;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Artisan;

class WipeAndSeedOnLogin {
    /**
     * Create the event listener.
     */
    public function __construct() {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void {
        // Truncate the tables
        Message::query()->delete();
        Image::query()->delete();

        // Reseed the tables
        Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\ImageSeeder']);
        Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\MessageSeeder']);

    }
}
