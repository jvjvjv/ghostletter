<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add soft deletes to friends table
        Schema::table('friends', function (Blueprint $table) {
            $table->softDeletes();
            $table->dropUnique(['user_id', 'friend_user_id']);
        });

        // Add soft deletes to messages table
        Schema::table('messages', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove soft deletes from friends table
        Schema::table('friends', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->unique(['user_id', 'friend_user_id']);
        });

        // Remove soft deletes from messages table
        Schema::table('messages', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
