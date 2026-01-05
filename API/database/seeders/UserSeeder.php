<?php

namespace Database\Seeders;

use App\Models\Friend;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder {
    public function run(): void {
        $alicia = User::create([
            'name' => 'Alicia Silver',
            'username' => 'demo01',
            'email' => 'alicia@ghostletter.app',
            'email_verified_at' => now(),
            'password' => Hash::make('demo01'),
            'initials' => 'AS',
            'color' => '#d6d6d7',
        ]);

        $raina = User::create([
            'name' => 'Raina Gold',
            'username' => 'demo02',
            'email' => 'raina@ghostletter.app',
            'email_verified_at' => now(),
            'password' => Hash::make('demo02'),
            'initials' => 'RG',
            'color' => '#D4AF37 ',
        ]);

        $dick = User::create([
            'name' => 'Dick Mitwin',
            'username' => 'demo03',
            'email' => 'dick@ghostletter.app',
            'email_verified_at' => now(),
            'password' => Hash::make('demo03'),
            'initials' => 'DW',
            'color' => '#8B4513 ',
        ]);

        // Create friendships
        Friend::create([
            'user_id' => $alicia->id,
            'friend_user_id' => $raina->id,
        ]);

        Friend::create([
            'user_id' => $raina->id,
            'friend_user_id' => $alicia->id,
        ]);

        Friend::create([
            'user_id' => $alicia->id,
            'friend_user_id' => $dick->id,
        ]);

        Friend::create([
            'user_id' => $dick->id,
            'friend_user_id' => $alicia->id,
        ]);
    }
}
