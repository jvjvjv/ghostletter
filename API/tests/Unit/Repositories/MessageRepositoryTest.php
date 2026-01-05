<?php

namespace Tests\Unit\Repositories;

use App\Models\Image;
use App\Models\Message;
use App\Models\User;
use App\Repositories\MessageRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private MessageRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new MessageRepository();
    }

    public function test_get_all_for_user_returns_sent_and_received_messages(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // Sent message
        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $otherUser->id,
            'content' => 'Sent message',
            'type' => 'text',
            'status' => 'sent',
        ]);

        // Received message
        Message::create([
            'sender_id' => $otherUser->id,
            'recipient_id' => $user->id,
            'content' => 'Received message',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->repository->getAllForUser($user->id);

        $this->assertCount(2, $result);
    }

    public function test_get_all_for_user_with_pagination(): void
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

        $result = $this->repository->getAllForUser($user->id, 10);

        $this->assertCount(10, $result);
        $this->assertEquals(15, $result->total());
    }

    public function test_get_all_for_user_orders_by_created_at_desc(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $oldMessage = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $otherUser->id,
            'content' => 'Old message',
            'type' => 'text',
            'status' => 'sent',
            'created_at' => now()->subDay(),
        ]);

        $newMessage = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $otherUser->id,
            'content' => 'New message',
            'type' => 'text',
            'status' => 'sent',
            'created_at' => now(),
        ]);

        $result = $this->repository->getAllForUser($user->id);

        $this->assertEquals($newMessage->id, $result->first()->id);
    }

    public function test_get_all_for_user_eager_loads_relationships(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $otherUser->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->repository->getAllForUser($user->id);

        $this->assertTrue($result->first()->relationLoaded('sender'));
        $this->assertTrue($result->first()->relationLoaded('recipient'));
        $this->assertTrue($result->first()->relationLoaded('image'));
    }

    public function test_get_conversation_returns_bilateral_messages(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();
        $stranger = User::factory()->create();

        // User to friend
        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $friend->id,
            'content' => 'Hello friend',
            'type' => 'text',
            'status' => 'sent',
        ]);

        // Friend to user
        Message::create([
            'sender_id' => $friend->id,
            'recipient_id' => $user->id,
            'content' => 'Hello back',
            'type' => 'text',
            'status' => 'sent',
        ]);

        // Stranger message (should not appear)
        Message::create([
            'sender_id' => $stranger->id,
            'recipient_id' => $user->id,
            'content' => 'Stranger message',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->repository->getConversation($user->id, $friend->id);

        $this->assertCount(2, $result);
    }

    public function test_get_conversation_orders_by_created_at_asc(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();

        $firstMessage = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $friend->id,
            'content' => 'First',
            'type' => 'text',
            'status' => 'sent',
            'created_at' => now()->subHour(),
        ]);

        $secondMessage = Message::create([
            'sender_id' => $friend->id,
            'recipient_id' => $user->id,
            'content' => 'Second',
            'type' => 'text',
            'status' => 'sent',
            'created_at' => now(),
        ]);

        $result = $this->repository->getConversation($user->id, $friend->id);

        $this->assertEquals($firstMessage->id, $result->first()->id);
        $this->assertEquals($secondMessage->id, $result->last()->id);
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

        $result = $this->repository->getConversation($user->id, $friend->id, 10);

        $this->assertCount(10, $result);
        $this->assertEquals(25, $result->total());
    }

    public function test_find_for_user_returns_message_when_sender(): void
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

        $result = $this->repository->findForUser($user->id, $message->id);

        $this->assertNotNull($result);
        $this->assertEquals($message->id, $result->id);
    }

    public function test_find_for_user_returns_message_when_recipient(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $message = Message::create([
            'sender_id' => $otherUser->id,
            'recipient_id' => $user->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->repository->findForUser($user->id, $message->id);

        $this->assertNotNull($result);
        $this->assertEquals($message->id, $result->id);
    }

    public function test_find_for_user_returns_null_for_unrelated_message(): void
    {
        $user = User::factory()->create();
        $otherUser1 = User::factory()->create();
        $otherUser2 = User::factory()->create();

        $message = Message::create([
            'sender_id' => $otherUser1->id,
            'recipient_id' => $otherUser2->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->repository->findForUser($user->id, $message->id);

        $this->assertNull($result);
    }

    public function test_find_for_user_eager_loads_relationships(): void
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

        $result = $this->repository->findForUser($user->id, $message->id);

        $this->assertTrue($result->relationLoaded('sender'));
        $this->assertTrue($result->relationLoaded('recipient'));
        $this->assertTrue($result->relationLoaded('image'));
    }

    public function test_find_for_recipient_returns_message(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $message = Message::create([
            'sender_id' => $otherUser->id,
            'recipient_id' => $user->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->repository->findForRecipient($user->id, $message->id);

        $this->assertNotNull($result);
        $this->assertEquals($message->id, $result->id);
    }

    public function test_find_for_recipient_returns_null_when_sender(): void
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

        $result = $this->repository->findForRecipient($user->id, $message->id);

        $this->assertNull($result);
    }

    public function test_find_for_sender_returns_message(): void
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

        $result = $this->repository->findForSender($user->id, $message->id);

        $this->assertNotNull($result);
        $this->assertEquals($message->id, $result->id);
    }

    public function test_find_for_sender_returns_null_when_recipient(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $message = Message::create([
            'sender_id' => $otherUser->id,
            'recipient_id' => $user->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $result = $this->repository->findForSender($user->id, $message->id);

        $this->assertNull($result);
    }

    public function test_create_creates_message_record(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $result = $this->repository->create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Hello world',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertInstanceOf(Message::class, $result);
        $this->assertDatabaseHas('messages', [
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Hello world',
        ]);
    }

    public function test_create_creates_image_message(): void
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

        $result = $this->repository->create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Image message',
            'type' => 'image',
            'status' => 'sent',
            'image_id' => $image->id,
        ]);

        $this->assertEquals('image', $result->type);
        $this->assertEquals($image->id, $result->image_id);
    }

    public function test_create_eager_loads_relationships(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $result = $this->repository->create([
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        $this->assertTrue($result->relationLoaded('sender'));
        $this->assertTrue($result->relationLoaded('recipient'));
    }

    public function test_update_modifies_message(): void
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

        $result = $this->repository->update($message, [
            'content' => 'Updated',
            'status' => 'delivered',
        ]);

        $this->assertEquals('Updated', $result->content);
        $this->assertEquals('delivered', $result->status);
        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'content' => 'Updated',
        ]);
    }

    public function test_update_returns_fresh_model_with_relationships(): void
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

        $result = $this->repository->update($message, ['is_read' => true]);

        $this->assertTrue($result->relationLoaded('sender'));
        $this->assertTrue($result->relationLoaded('recipient'));
    }

    public function test_delete_soft_deletes_message(): void
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

        $result = $this->repository->delete($message);

        $this->assertTrue($result);
        $this->assertSoftDeleted('messages', ['id' => $message->id]);
    }
}
