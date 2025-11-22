<?php

namespace App\Providers;

use App\Repositories\FriendRepository;
use App\Repositories\MessageRepository;
use App\Repositories\ImageRepository;
use App\Services\FriendService;
use App\Services\MessageService;
use App\Services\ImageService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register repositories as singletons for better performance
        $this->app->singleton(FriendRepository::class);
        $this->app->singleton(MessageRepository::class);
        $this->app->singleton(ImageRepository::class);

        // Register services as singletons
        $this->app->singleton(FriendService::class);
        $this->app->singleton(MessageService::class);
        $this->app->singleton(ImageService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
