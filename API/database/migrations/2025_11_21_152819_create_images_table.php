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
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('path'); // Storage path
            $table->string('url'); // Public URL
            $table->string('filename');
            $table->string('mime_type');
            $table->integer('size')->nullable(); // File size in bytes
            $table->integer('width')->nullable(); // Image width in pixels
            $table->integer('height')->nullable(); // Image height in pixels
            $table->timestamps();
            $table->softDeletes();

            // Index for performance
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('images');
    }
};
