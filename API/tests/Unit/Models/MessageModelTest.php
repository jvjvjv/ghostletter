<?php

namespace Tests\Unit\Models;

use App\Models\Image;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_belongs_to_sender(): void
    {
        $sender = User::factory()->create(['name' => 'Sender Name']);
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertInstanceOf(User::class, $message->sender);
        $this->assertEquals($sender->id, $message->sender->id);
        $this->assertEquals('Sender Name', $message->sender->name);
    }

    public function test_message_belongs_to_recipient(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create(['name' => 'Recipient Name']);

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertInstanceOf(User::class, $message->recipient);
        $this->assertEquals($recipient->id, $message->recipient->id);
        $this->assertEquals('Recipient Name', $message->recipient->name);
    }

    public function test_message_belongs_to_image(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $image = Image::create([
            'user_id' => $sender->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Photo',
            'type' => 'image',
            'status' => 'sent',
            'image_id' => $image->id,
        ]);

        $this->assertInstanceOf(Image::class, $message->image);
        $this->assertEquals($image->id, $message->image->id);
    }

    public function test_message_image_is_nullable(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Text only',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertNull($message->image);
    }

    public function test_message_uses_soft_deletes(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $message->delete();

        $this->assertSoftDeleted('messages', ['id' => $message->id]);
        $this->assertNotNull(Message::withTrashed()->find($message->id));
    }

    public function test_message_casts_is_read_to_boolean(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
            'is_read' => 1,
        ]);

        $this->assertIsBool($message->is_read);
        $this->assertTrue($message->is_read);
    }

    public function test_message_casts_img_viewed_to_boolean(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'image',
            'status' => 'sent',
            'img_viewed' => 0,
        ]);

        $this->assertIsBool($message->img_viewed);
        $this->assertFalse($message->img_viewed);
    }

    public function test_message_casts_expiry_timestamp_to_datetime(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $expiry = Carbon::now()->addSeconds(30);

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'image',
            'status' => 'sent',
            'expiry_timestamp' => $expiry,
        ]);

        $this->assertInstanceOf(Carbon::class, $message->expiry_timestamp);
    }

    public function test_message_has_correct_fillable(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        $image = Image::create([
            'user_id' => $sender->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test content',
            'type' => 'image',
            'is_read' => true,
            'status' => 'delivered',
            'image_id' => $image->id,
            'img_viewed' => true,
            'expiry_timestamp' => Carbon::now()->addMinute(),
        ]);

        $this->assertEquals($sender->id, $message->sender_id);
        $this->assertEquals($recipient->id, $message->recipient_id);
        $this->assertEquals('Test content', $message->content);
        $this->assertEquals('image', $message->type);
        $this->assertTrue($message->is_read);
        $this->assertEquals('delivered', $message->status);
        $this->assertEquals($image->id, $message->image_id);
        $this->assertTrue($message->img_viewed);
        $this->assertNotNull($message->expiry_timestamp);
    }

    public function test_message_timestamps_are_set(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertNotNull($message->created_at);
        $this->assertNotNull($message->updated_at);
    }

    public function test_message_can_be_restored(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $message->delete();
        $this->assertSoftDeleted('messages', ['id' => $message->id]);

        $message->restore();
        $this->assertNull(Message::find($message->id)->deleted_at);
    }
}
