<?php

namespace Tests\Unit\Models;

use App\Models\Friend;
use App\Models\Image;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_many_friends(): void
    {
        $user = User::factory()->create();
        $friendUsers = User::factory()->count(3)->create();

        foreach ($friendUsers as $friendUser) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friendUser->id,
            ]);
        }

        $this->assertCount(3, $user->friends);
        $this->assertInstanceOf(Friend::class, $user->friends->first());
    }

    public function test_user_has_many_sent_messages(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();

        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $recipient->id,
            'content' => 'Message 1',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $recipient->id,
            'content' => 'Message 2',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertCount(2, $user->sentMessages);
        $this->assertInstanceOf(Message::class, $user->sentMessages->first());
    }

    public function test_user_has_many_received_messages(): void
    {
        $user = User::factory()->create();
        $sender = User::factory()->create();

        Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $user->id,
            'content' => 'Received 1',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $user->id,
            'content' => 'Received 2',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertCount(2, $user->receivedMessages);
    }

    public function test_user_has_many_images(): void
    {
        $user = User::factory()->create();

        Image::create([
            'user_id' => $user->id,
            'path' => 'images/test1.jpg',
            'url' => '/storage/images/test1.jpg',
            'filename' => 'test1.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        Image::create([
            'user_id' => $user->id,
            'path' => 'images/test2.jpg',
            'url' => '/storage/images/test2.jpg',
            'filename' => 'test2.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 2048,
        ]);

        $this->assertCount(2, $user->images);
        $this->assertInstanceOf(Image::class, $user->images->first());
    }

    public function test_user_hidden_attributes(): void
    {
        $user = User::factory()->create([
            'password' => 'secret123',
        ]);

        $array = $user->toArray();

        $this->assertArrayNotHasKey('password', $array);
        $this->assertArrayNotHasKey('remember_token', $array);
    }

    public function test_user_fillable_attributes(): void
    {
        $user = User::create([
            'name' => 'John Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('johndoe', $user->username);
        $this->assertEquals('john@example.com', $user->email);
    }

    public function test_user_casts_email_verified_at(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => '2025-01-01 12:00:00',
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $user->email_verified_at);
    }

    public function test_user_has_factory(): void
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(User::class, $user);
        $this->assertNotEmpty($user->name);
        $this->assertNotEmpty($user->email);
    }
}
