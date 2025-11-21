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
        Schema::table('messages', function (Blueprint $table) {
            // Add foreign key to images table
            $table->foreignId('image_id')->nullable()->after('type')->constrained()->nullOnDelete();

            // Remove old image fields
            $table->dropColumn(['image_url', 'image_description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Restore old image fields
            $table->string('image_url')->nullable();
            $table->string('image_description')->nullable();

            // Drop foreign key and column
            $table->dropForeign(['image_id']);
            $table->dropColumn('image_id');
        });
    }
};
