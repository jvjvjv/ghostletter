<?php

namespace Tests\Unit\Services;

use App\Models\Friend;
use App\Models\User;
use App\Repositories\FriendRepository;
use App\Services\FriendService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendServiceTest extends TestCase
{
    use RefreshDatabase;

    private FriendService $service;
    private FriendRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new FriendRepository();
        $this->service = new FriendService($this->repository);
    }

    public function test_get_all_friends_returns_paginated_friends(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(15)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        $result = $this->service->getAllFriends($user->id, 10);

        $this->assertCount(10, $result);
        $this->assertEquals(15, $result->total());
    }

    public function test_get_all_friends_returns_collection_without_pagination(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(5)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        $result = $this->service->getAllFriends($user->id);

        $this->assertCount(5, $result);
    }

    public function test_get_friends_list_returns_friend_users(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create(['name' => 'John Doe']);

        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->service->getFriendsList($user->id);

        $this->assertCount(1, $result);
        $this->assertEquals('John Doe', $result->first()->name);
        $this->assertInstanceOf(User::class, $result->first());
    }

    public function test_get_friends_list_with_pagination(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(15)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        $result = $this->service->getFriendsList($user->id, 10);

        $this->assertCount(10, $result);
        $this->assertEquals(15, $result->total());
    }

    public function test_get_friend_returns_specific_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->service->getFriend($user->id, $friendship->id);

        $this->assertNotNull($result);
        $this->assertEquals($friendship->id, $result->id);
    }

    public function test_get_friend_returns_null_for_invalid_id(): void
    {
        $user = User::factory()->create();

        $result = $this->service->getFriend($user->id, 99999);

        $this->assertNull($result);
    }

    public function test_get_friend_returns_null_for_other_users_friendship(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user1->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->service->getFriend($user2->id, $friendship->id);

        $this->assertNull($result);
    }

    public function test_add_friend_creates_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $result = $this->service->addFriend($user->id, $friendUser->id);

        $this->assertInstanceOf(Friend::class, $result);
        $this->assertEquals($user->id, $result->user_id);
        $this->assertEquals($friendUser->id, $result->friend_user_id);
        $this->assertDatabaseHas('friends', [
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);
    }

    public function test_add_friend_throws_when_already_friends(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Friend already added');

        $this->service->addFriend($user->id, $friendUser->id);
    }

    public function test_add_friend_throws_when_friending_self(): void
    {
        $user = User::factory()->create();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot add yourself as a friend');

        $this->service->addFriend($user->id, $user->id);
    }

    public function test_add_friend_creates_friendship_with_eager_loaded_friend_user(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create(['name' => 'Jane Smith']);

        $result = $this->service->addFriend($user->id, $friendUser->id);

        $this->assertTrue($result->relationLoaded('friendUser'));
        $this->assertEquals('Jane Smith', $result->friendUser->name);
    }

    public function test_remove_friend_deletes_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $this->service->removeFriend($user->id, $friendship->id);

        $this->assertSoftDeleted('friends', ['id' => $friendship->id]);
    }

    public function test_remove_friend_throws_for_invalid_id(): void
    {
        $user = User::factory()->create();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Friend not found');

        $this->service->removeFriend($user->id, 99999);
    }

    public function test_remove_friend_throws_for_other_users_friendship(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user1->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Friend not found');

        $this->service->removeFriend($user2->id, $friendship->id);
    }
}
