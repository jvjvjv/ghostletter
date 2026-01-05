<?php

namespace Tests\Unit\Services;

use App\Models\Image;
use App\Models\Message;
use App\Models\User;
use App\Repositories\MessageRepository;
use App\Services\MessageService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageServiceTest extends TestCase
{
    use RefreshDatabase;

    private MessageService $service;
    private MessageRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new MessageRepository();
        $this->service = new MessageService($this->repository);
    }

    public function test_get_all_messages_returns_user_messages(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $otherUser->id,
            'content' => 'Sent',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Message::create([
            'sender_id' => $otherUser->id,
            'recipient_id' => $user->id,
            'content' => 'Received',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->service->getAllMessages($user->id);

        $this->assertCount(2, $result);
    }

    public function test_get_all_messages_with_pagination(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        for ($i = 0; $i < 15; $i++) {
            Message::create([
                'sender_id' => $user->id,
                'recipient_id' => $otherUser->id,
                'content' => "Message $i",
                'type' => 'text',
                'status' => 'sent',
            ]);
        }

        $result = $this->service->getAllMessages($user->id, 10);

        $this->assertCount(10, $result);
        $this->assertEquals(15, $result->total());
    }

    public function test_get_conversation_returns_messages_with_friend(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();

        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $friend->id,
            'content' => 'Hello',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Message::create([
            'sender_id' => $friend->id,
            'recipient_id' => $user->id,
            'content' => 'Hi there',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->service->getConversation($user->id, $friend->id);

        $this->assertCount(2, $result);
    }

    public function test_get_conversation_with_pagination(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();

        for ($i = 0; $i < 25; $i++) {
            Message::create([
                'sender_id' => $i % 2 === 0 ? $user->id : $friend->id,
                'recipient_id' => $i % 2 === 0 ? $friend->id : $user->id,
                'content' => "Message $i",
                'type' => 'text',
                'status' => 'sent',
            ]);
        }

        $result = $this->service->getConversation($user->id, $friend->id, 10);

        $this->assertCount(10, $result);
        $this->assertEquals(25, $result->total());
    }

    public function test_get_message_returns_specific_message(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $message = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $otherUser->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->service->getMessage($user->id, $message->id);

        $this->assertNotNull($result);
        $this->assertEquals($message->id, $result->id);
    }

    public function test_get_message_returns_null_for_invalid_id(): void
    {
        $user = User::factory()->create();

        $result = $this->service->getMessage($user->id, 99999);

        $this->assertNull($result);
    }

    public function test_get_message_returns_null_for_unrelated_message(): void
    {
        $user = User::factory()->create();
        $other1 = User::factory()->create();
        $other2 = User::factory()->create();

        $message = Message::create([
            'sender_id' => $other1->id,
            'recipient_id' => $other2->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->service->getMessage($user->id, $message->id);

        $this->assertNull($result);
    }

    public function test_send_message_creates_text_message(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $result = $this->service->sendMessage($sender->id, [
            'recipient_id' => $recipient->id,
            'content' => 'Hello world',
            'type' => 'text',
        ]);

        $this->assertInstanceOf(Message::class, $result);
        $this->assertEquals($sender->id, $result->sender_id);
        $this->assertEquals($recipient->id, $result->recipient_id);
        $this->assertEquals('Hello world', $result->content);
        $this->assertEquals('text', $result->type);
    }

    public function test_send_message_creates_image_message(): void
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

        $result = $this->service->sendMessage($sender->id, [
            'recipient_id' => $recipient->id,
            'content' => 'Check this out',
            'type' => 'image',
            'image_id' => $image->id,
        ]);

        $this->assertEquals('image', $result->type);
        $this->assertEquals($image->id, $result->image_id);
    }

    public function test_send_message_sets_default_status(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $result = $this->service->sendMessage($sender->id, [
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
        ]);

        $this->assertEquals('sent', $result->status);
    }

    public function test_update_message_modifies_content(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Original',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->service->updateMessage($sender->id, $message->id, [
            'content' => 'Updated',
        ]);

        $this->assertEquals('Updated', $result->content);
    }

    public function test_update_message_throws_when_not_sender(): void
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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Message not found or not authorized');

        $this->service->updateMessage($recipient->id, $message->id, [
            'content' => 'Hacked',
        ]);
    }

    public function test_mark_as_read_updates_is_read(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
            'is_read' => false,
        ]);

        $result = $this->service->markAsRead($recipient->id, $message->id);

        $this->assertTrue($result->is_read);
    }

    public function test_mark_as_read_updates_status_to_read(): void
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

        $result = $this->service->markAsRead($recipient->id, $message->id);

        $this->assertEquals('read', $result->status);
    }

    public function test_mark_as_read_throws_when_not_recipient(): void
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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Message not found or not authorized');

        $this->service->markAsRead($sender->id, $message->id);
    }

    public function test_mark_image_as_viewed_sets_img_viewed(): void
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
            'img_viewed' => false,
        ]);

        $result = $this->service->markImageAsViewed($recipient->id, $message->id);

        $this->assertTrue($result->img_viewed);
    }

    public function test_mark_image_as_viewed_sets_expiry_timestamp(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 1, 12, 0, 0));

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
            'img_viewed' => false,
        ]);

        $result = $this->service->markImageAsViewed($recipient->id, $message->id);

        $this->assertNotNull($result->expiry_timestamp);
        $this->assertEquals(
            Carbon::create(2025, 1, 1, 12, 0, 30)->timestamp,
            $result->expiry_timestamp->timestamp
        );

        Carbon::setTestNow();
    }

    public function test_mark_image_as_viewed_only_sets_expiry_on_first_view(): void
    {
        Carbon::setTestNow(Carbon::create(2025, 1, 1, 12, 0, 0));

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

        $firstExpiry = Carbon::create(2025, 1, 1, 12, 0, 30);

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Photo',
            'type' => 'image',
            'status' => 'sent',
            'image_id' => $image->id,
            'img_viewed' => true,
            'expiry_timestamp' => $firstExpiry,
        ]);

        Carbon::setTestNow(Carbon::create(2025, 1, 1, 12, 0, 15));

        $result = $this->service->markImageAsViewed($recipient->id, $message->id);

        $this->assertEquals($firstExpiry->timestamp, $result->expiry_timestamp->timestamp);

        Carbon::setTestNow();
    }

    public function test_mark_image_as_viewed_throws_when_not_recipient(): void
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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Message not found or not authorized');

        $this->service->markImageAsViewed($sender->id, $message->id);
    }

    public function test_mark_image_as_viewed_throws_when_not_image_type(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Text message',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Message is not an image type');

        $this->service->markImageAsViewed($recipient->id, $message->id);
    }

    public function test_mark_image_as_viewed_also_marks_as_read(): void
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
            'is_read' => false,
        ]);

        $result = $this->service->markImageAsViewed($recipient->id, $message->id);

        $this->assertTrue($result->is_read);
    }

    public function test_delete_message_removes_message(): void
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

        $this->service->deleteMessage($sender->id, $message->id);

        $this->assertSoftDeleted('messages', ['id' => $message->id]);
    }

    public function test_delete_message_throws_when_not_sender(): void
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

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Message not found or not authorized');

        $this->service->deleteMessage($recipient->id, $message->id);
    }

    public function test_delete_message_throws_for_invalid_id(): void
    {
        $user = User::factory()->create();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Message not found or not authorized');

        $this->service->deleteMessage($user->id, 99999);
    }
}
