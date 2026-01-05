<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ImageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Friends
    Route::apiResource('friends', FriendController::class);
    Route::get('/friends-list', [FriendController::class, 'friendsList']);

    // Messages
    Route::apiResource('messages', MessageController::class);
    Route::get('/conversations/{friendId}', [MessageController::class, 'conversation']);
    Route::post('/messages/{id}/mark-read', [MessageController::class, 'markAsRead']);
    Route::post('/messages/{id}/mark-viewed', [MessageController::class, 'markImageAsViewed']);

    // Images
    Route::post('/images/upload', [ImageController::class, 'upload']);
});
