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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->enum('type', ['text', 'image'])->default('text');
            $table->boolean('is_read')->default(false);
            $table->enum('status', ['sent', 'delivered', 'read', 'expired'])->default('sent');

            // Image-specific fields
            $table->string('image_url')->nullable();
            $table->string('image_description')->nullable();
            $table->boolean('img_viewed')->default(false);
            $table->timestamp('expiry_timestamp')->nullable();

            $table->timestamps();

            // Indexes for performance
            $table->index(['sender_id', 'recipient_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
