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
        // Optimize images table string fields
        Schema::table('images', function (Blueprint $table) {
            $table->string('path', 500)->change();
            $table->string('url', 500)->change();
            $table->string('filename', 100)->change();
            $table->string('mime_type', 50)->change();
        });

        // Optimize users table string fields
        Schema::table('users', function (Blueprint $table) {
            $table->string('color', 20)->nullable()->change();
            $table->string('avatar_url', 500)->nullable()->change();
            $table->string('initials', 3)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert images table to default string length (255)
        Schema::table('images', function (Blueprint $table) {
            $table->string('path')->change();
            $table->string('url')->change();
            $table->string('filename')->change();
            $table->string('mime_type')->change();
        });

        // Revert users table to original lengths
        Schema::table('users', function (Blueprint $table) {
            $table->string('color', 50)->nullable()->change();
            $table->string('avatar_url')->nullable()->change();
            $table->string('initials')->nullable()->change();
        });
    }
};
