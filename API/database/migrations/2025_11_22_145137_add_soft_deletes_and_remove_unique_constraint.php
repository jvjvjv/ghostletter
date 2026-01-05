<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        // Add soft deletes to friends table
        Schema::table('friends', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['user_id']);
            $table->dropForeign(['friend_user_id']);

            // Now drop the unique constraint
            $table->dropUnique(['user_id', 'friend_user_id']);

            // Recreate foreign keys
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('friend_user_id')->references('id')->on('users')->cascadeOnDelete();

            // Add soft deletes
            $table->softDeletes();
        });

        // Add soft deletes to messages table
        Schema::table('messages', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        // Remove soft deletes from friends table
        Schema::table('friends', function (Blueprint $table) {
            // Drop foreign keys
            $table->dropForeign(['user_id']);
            $table->dropForeign(['friend_user_id']);

            // Add back unique constraint
            $table->unique(['user_id', 'friend_user_id']);

            // Recreate foreign keys
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('friend_user_id')->references('id')->on('users')->cascadeOnDelete();

            // Remove soft deletes
            $table->dropSoftDeletes();
        });

        // Remove soft deletes from messages table
        Schema::table('messages', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
