<?php

namespace Tests\Feature\Api;

use App\Models\Friend;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FriendControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_paginated_friends(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(15)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('total', 15);
    }

    public function test_index_returns_all_friends_without_pagination(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(5)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends');

        $response->assertStatus(200)
            ->assertJsonCount(5);
    }

    public function test_index_returns_empty_when_no_friends(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends');

        $response->assertStatus(200)
            ->assertJson([]);
    }

    public function test_index_includes_friend_user_data(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create([
            'name' => 'Friend Name',
            'email' => 'friend@example.com',
        ]);

        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'Friend Name',
            ]);
    }

    public function test_friends_list_returns_friend_users(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create(['name' => 'John Doe']);

        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends-list');

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'John Doe']);
    }

    public function test_friends_list_with_pagination(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(15)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends-list?per_page=10');

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('total', 15);
    }

    public function test_store_creates_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/friends', [
            'friend_user_id' => $friendUser->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user_id', $user->id)
            ->assertJsonPath('friend_user_id', $friendUser->id);

        $this->assertDatabaseHas('friends', [
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);
    }

    public function test_store_validates_friend_user_id_required(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/friends', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['friend_user_id']);
    }

    public function test_store_validates_friend_user_id_exists(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/friends', [
            'friend_user_id' => 99999,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['friend_user_id']);
    }

    public function test_store_prevents_duplicate_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/friends', [
            'friend_user_id' => $friendUser->id,
        ]);

        $response->assertStatus(409)
            ->assertJson(['message' => 'Friend already added']);
    }

    public function test_store_prevents_self_friending(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/friends', [
            'friend_user_id' => $user->id,
        ]);

        $response->assertStatus(409)
            ->assertJson(['message' => 'Cannot add yourself as a friend']);
    }

    public function test_show_returns_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create(['name' => 'Friend Name']);

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/friends/{$friendship->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $friendship->id)
            ->assertJsonFragment(['name' => 'Friend Name']);
    }

    public function test_show_returns_404_for_invalid_id(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends/99999');

        $response->assertStatus(404)
            ->assertJson(['message' => 'Friend not found']);
    }

    public function test_show_returns_404_for_other_users_friendship(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user1->id,
            'friend_user_id' => $friendUser->id,
        ]);

        Sanctum::actingAs($user2);

        $response = $this->getJson("/api/friends/{$friendship->id}");

        $response->assertStatus(404);
    }

    public function test_destroy_removes_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/friends/{$friendship->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Friend removed successfully']);

        $this->assertSoftDeleted('friends', ['id' => $friendship->id]);
    }

    public function test_destroy_returns_404_for_invalid_id(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/friends/99999');

        $response->assertStatus(404);
    }

    public function test_destroy_returns_404_for_other_users_friendship(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user1->id,
            'friend_user_id' => $friendUser->id,
        ]);

        Sanctum::actingAs($user2);

        $response = $this->deleteJson("/api/friends/{$friendship->id}");

        $response->assertStatus(404);
    }
}
