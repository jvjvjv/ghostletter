<?php

namespace Database\Seeders;

use App\Models\Friend;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create demo users for E2E testing
        $demo01 = User::create([
            'name' => 'Demo User 01',
            'username' => 'demo01',
            'email' => 'demo01@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('demo01'),
            'initials' => 'D1',
            'color' => '#3B82F6',
        ]);

        $demo02 = User::create([
            'name' => 'Demo User 02',
            'username' => 'demo02',
            'email' => 'demo02@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('demo02'),
            'initials' => 'D2',
            'color' => '#10B981',
        ]);

        $demo03 = User::create([
            'name' => 'Demo User 03',
            'username' => 'demo03',
            'email' => 'demo03@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('demo03'),
            'initials' => 'D3',
            'color' => '#F59E0B',
        ]);

        // Create friendships
        Friend::create([
            'user_id' => $demo01->id,
            'friend_user_id' => $demo02->id,
        ]);

        Friend::create([
            'user_id' => $demo02->id,
            'friend_user_id' => $demo01->id,
        ]);

        Friend::create([
            'user_id' => $demo01->id,
            'friend_user_id' => $demo03->id,
        ]);

        Friend::create([
            'user_id' => $demo03->id,
            'friend_user_id' => $demo01->id,
        ]);

        // Create some test messages
        Message::create([
            'sender_id' => $demo02->id,
            'recipient_id' => $demo01->id,
            'content' => 'Hey! How are you?',
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => false,
        ]);

        Message::create([
            'sender_id' => $demo01->id,
            'recipient_id' => $demo02->id,
            'content' => "I'm good! Thanks for asking.",
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => true,
        ]);

        Message::create([
            'sender_id' => $demo03->id,
            'recipient_id' => $demo01->id,
            'content' => 'Check out this cool feature!',
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => false,
        ]);

        Message::create([
            'sender_id' => $demo01->id,
            'recipient_id' => $demo03->id,
            'content' => 'That looks awesome!',
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => true,
        ]);
    }
}
