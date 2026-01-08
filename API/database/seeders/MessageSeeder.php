<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use App\Models\Image;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder {
    public function run(): void {
        $alicia = User::where(['name' => 'Alicia Silver'])->first();
        $raina = User::where(['name' => 'Raina Gold'])->first();
        $dick = User::where(['name' => 'Dick Mitwin'])->first();
        // Create some test messages
        $message_times_now_minus = [
            rand(120, 88), // Raina to Alicia - how'd last night go
            rand(87, 73), // Alicia to Raina - he's so weird
            rand(83, 60), // Dick to Alicia - I had a great time last night!
            rand(59, 58), // Dick to Alicia - Incoming dick pic!!!
            rand(58, 57), // Dick to Alicia - Dick pic
            rand(73, 57), // Raina to Alicia - Did he sent you a dick pic yet? He IS so weird!
        ];

        Message::create([
            'sender_id' => $raina->id,
            'recipient_id' => $alicia->id,
            'content' => "how'd last night go",
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => true,
            'created_at' => now()->sub('minutes', $message_times_now_minus[0]),
            'updated_at' => now()->sub('minutes', $message_times_now_minus[0]),
        ]);

        Message::create([
            'sender_id' => $alicia->id,
            'recipient_id' => $raina->id,
            'content' => 'It was okay. He seems a little weird, though!',
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => true,
            'created_at' => now()->sub('minutes', $message_times_now_minus[1]),
            'updated_at' => now()->sub('minutes', $message_times_now_minus[1]),
        ]);

        Message::create([
            'sender_id' => $dick->id,
            'recipient_id' => $alicia->id,
            'content' => 'I had a great time last night, Alice!',
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => false,
            'created_at' => now()->sub('minutes', $message_times_now_minus[2]),
            'updated_at' => now()->sub('minutes', $message_times_now_minus[2]),
        ]);
        Message::create([
            'sender_id' => $dick->id,
            'recipient_id' => $alicia->id,
            'content' => 'Incoming dick pic!!!',
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => false,
            'created_at' => now()->sub('minutes', $message_times_now_minus[3]),
            'updated_at' => now()->sub('minutes', $message_times_now_minus[3]),
        ]);

        Message::create([
            'sender_id' => $dick->id,
            'recipient_id' => $alicia->id,
            'content' => '',
            'image_id' => Image::inRandomOrder()->first()->id,
            'type' => 'image',
            'status' => 'delivered',
            'is_read' => false,
            'created_at' => now()->sub('minutes', $message_times_now_minus[4]),
            'updated_at' => now()->sub('minutes', $message_times_now_minus[4]),
        ]);


        Message::create([
            'sender_id' => $raina->id,
            'recipient_id' => $alicia->id,
            'content' => 'did he sent you a dick pic yet? he IS so weird!',
            'type' => 'text',
            'status' => 'delivered',
            'is_read' => false,
            'created_at' => now()->sub('minutes', $message_times_now_minus[5]),
            'updated_at' => now()->sub('minutes', $message_times_now_minus[5]),

        ]);
    }
}
