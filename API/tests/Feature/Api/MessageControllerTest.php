<?php

namespace Tests\Feature\Api;

use App\Models\Image;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_all_messages(): void
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

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/messages');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_index_with_pagination(): void
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

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/messages?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('total', 15);
    }

    public function test_index_excludes_unrelated_messages(): void
    {
        $user = User::factory()->create();
        $other1 = User::factory()->create();
        $other2 = User::factory()->create();

        // User's message
        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $other1->id,
            'content' => 'My message',
            'type' => 'text',
            'status' => 'sent',
        ]);

        // Unrelated message
        Message::create([
            'sender_id' => $other1->id,
            'recipient_id' => $other2->id,
            'content' => 'Not mine',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/messages');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    public function test_conversation_returns_bilateral_messages(): void
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
            'content' => 'Hi back',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/conversations/{$friend->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_conversation_returns_empty_for_no_messages(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/conversations/{$friend->id}");

        $response->assertStatus(200)
            ->assertJson([]);
    }

    public function test_conversation_with_pagination(): void
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

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/conversations/{$friend->id}?per_page=10");

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('total', 25);
    }

    public function test_store_creates_text_message(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'content' => 'Hello world',
            'type' => 'text',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('sender_id', $user->id)
            ->assertJsonPath('recipient_id', $recipient->id)
            ->assertJsonPath('content', 'Hello world')
            ->assertJsonPath('type', 'text')
            ->assertJsonPath('status', 'sent');

        $this->assertDatabaseHas('messages', [
            'sender_id' => $user->id,
            'recipient_id' => $recipient->id,
            'content' => 'Hello world',
        ]);
    }

    public function test_store_creates_image_message(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();
        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'content' => 'Check this photo',
            'type' => 'image',
            'image_id' => $image->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('type', 'image')
            ->assertJsonPath('image_id', $image->id);
    }

    public function test_store_validates_recipient_required(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/messages', [
            'content' => 'Hello',
            'type' => 'text',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['recipient_id']);
    }

    public function test_store_validates_content_required(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'type' => 'text',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_store_validates_type_required(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'content' => 'Hello',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_store_validates_type_enum(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/messages', [
            'recipient_id' => $recipient->id,
            'content' => 'Hello',
            'type' => 'invalid',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_show_returns_message(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $message = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $otherUser->id,
            'content' => 'Test message',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/messages/{$message->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $message->id)
            ->assertJsonPath('content', 'Test message');
    }

    public function test_show_returns_404_for_invalid_id(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/messages/99999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Message not found']);
    }

    public function test_show_returns_404_for_unrelated_message(): void
    {
        $user = User::factory()->create();
        $other1 = User::factory()->create();
        $other2 = User::factory()->create();

        $message = Message::create([
            'sender_id' => $other1->id,
            'recipient_id' => $other2->id,
            'content' => 'Not mine',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/messages/{$message->id}");

        $response->assertStatus(404);
    }

    public function test_update_modifies_message(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $recipient->id,
            'content' => 'Original',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/messages/{$message->id}", [
            'content' => 'Updated',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('content', 'Updated');
    }

    public function test_update_returns_404_when_not_sender(): void
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

        Sanctum::actingAs($recipient);

        $response = $this->patchJson("/api/messages/{$message->id}", [
            'content' => 'Hacked',
        ]);

        $response->assertStatus(404);
    }

    public function test_mark_as_read_updates_message(): void
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

        Sanctum::actingAs($recipient);

        $response = $this->postJson("/api/messages/{$message->id}/mark-read");

        $response->assertStatus(200)
            ->assertJsonPath('is_read', true)
            ->assertJsonPath('status', 'read');
    }

    public function test_mark_as_read_returns_404_when_not_recipient(): void
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

        Sanctum::actingAs($sender);

        $response = $this->postJson("/api/messages/{$message->id}/mark-read");

        $response->assertStatus(404);
    }

    public function test_mark_image_as_viewed_updates_message(): void
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

        Sanctum::actingAs($recipient);

        $response = $this->postJson("/api/messages/{$message->id}/mark-viewed");

        $response->assertStatus(200)
            ->assertJsonPath('img_viewed', true)
            ->assertJsonPath('is_read', true);

        $this->assertNotNull($response->json('expiry_timestamp'));
    }

    public function test_mark_image_as_viewed_sets_expiry(): void
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
        ]);

        Sanctum::actingAs($recipient);

        $response = $this->postJson("/api/messages/{$message->id}/mark-viewed");

        $response->assertStatus(200);

        $expiryTimestamp = Carbon::parse($response->json('expiry_timestamp'));
        // Use absolute value since expiry is in the future
        $this->assertEqualsWithDelta(30, abs($expiryTimestamp->diffInSeconds(Carbon::now())), 2);

        Carbon::setTestNow();
    }

    public function test_mark_image_as_viewed_returns_404_when_not_recipient(): void
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

        Sanctum::actingAs($sender);

        $response = $this->postJson("/api/messages/{$message->id}/mark-viewed");

        $response->assertStatus(400);
    }

    public function test_mark_image_as_viewed_returns_400_for_text_message(): void
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

        Sanctum::actingAs($recipient);

        $response = $this->postJson("/api/messages/{$message->id}/mark-viewed");

        $response->assertStatus(400)
            ->assertJson(['message' => 'Message is not an image type']);
    }

    public function test_destroy_deletes_message(): void
    {
        $user = User::factory()->create();
        $recipient = User::factory()->create();

        $message = Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $recipient->id,
            'content' => 'Test',
            'type' => 'text',
            'status' => 'sent',
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/messages/{$message->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Message deleted successfully']);

        $this->assertSoftDeleted('messages', ['id' => $message->id]);
    }

    public function test_destroy_returns_404_when_not_sender(): void
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

        Sanctum::actingAs($recipient);

        $response = $this->deleteJson("/api/messages/{$message->id}");

        $response->assertStatus(404);
    }

    public function test_destroy_returns_404_for_invalid_id(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/messages/99999');

        $response->assertStatus(404);
    }
}
