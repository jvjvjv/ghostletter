<?php

namespace Tests\Unit\Repositories;

use App\Models\Friend;
use App\Models\User;
use App\Repositories\FriendRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private FriendRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new FriendRepository();
    }

    public function test_get_all_for_user_returns_friends_with_pagination(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(15)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        $result = $this->repository->getAllForUser($user->id, 10);

        $this->assertCount(10, $result);
        $this->assertEquals(15, $result->total());
        $this->assertTrue($result->hasMorePages());
    }

    public function test_get_all_for_user_returns_collection_without_pagination(): void
    {
        $user = User::factory()->create();
        $friends = User::factory()->count(5)->create();

        foreach ($friends as $friend) {
            Friend::create([
                'user_id' => $user->id,
                'friend_user_id' => $friend->id,
            ]);
        }

        $result = $this->repository->getAllForUser($user->id);

        $this->assertCount(5, $result);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Collection::class, $result);
    }

    public function test_get_all_for_user_returns_empty_when_no_friends(): void
    {
        $user = User::factory()->create();

        $result = $this->repository->getAllForUser($user->id);

        $this->assertCount(0, $result);
    }

    public function test_get_all_for_user_eager_loads_friend_user(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create(['name' => 'John Doe']);

        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->repository->getAllForUser($user->id);

        $this->assertTrue($result->first()->relationLoaded('friendUser'));
        $this->assertEquals('John Doe', $result->first()->friendUser->name);
    }

    public function test_find_for_user_returns_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->repository->findForUser($user->id, $friendship->id);

        $this->assertNotNull($result);
        $this->assertEquals($friendship->id, $result->id);
        $this->assertTrue($result->relationLoaded('friendUser'));
    }

    public function test_find_for_user_returns_null_for_other_users_friendship(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user1->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->repository->findForUser($user2->id, $friendship->id);

        $this->assertNull($result);
    }

    public function test_find_for_user_returns_null_for_nonexistent_id(): void
    {
        $user = User::factory()->create();

        $result = $this->repository->findForUser($user->id, 99999);

        $this->assertNull($result);
    }

    public function test_exists_returns_true_when_friendship_exists(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->repository->exists($user->id, $friendUser->id);

        $this->assertTrue($result);
    }

    public function test_exists_returns_false_when_no_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $result = $this->repository->exists($user->id, $friendUser->id);

        $this->assertFalse($result);
    }

    public function test_exists_returns_false_for_reverse_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        // Create friendship in one direction
        Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        // Check reverse direction
        $result = $this->repository->exists($friendUser->id, $user->id);

        $this->assertFalse($result);
    }

    public function test_create_creates_friendship_record(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $result = $this->repository->create($user->id, $friendUser->id);

        $this->assertInstanceOf(Friend::class, $result);
        $this->assertEquals($user->id, $result->user_id);
        $this->assertEquals($friendUser->id, $result->friend_user_id);
        $this->assertDatabaseHas('friends', [
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);
    }

    public function test_create_eager_loads_friend_user(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create(['name' => 'Jane Smith']);

        $result = $this->repository->create($user->id, $friendUser->id);

        $this->assertTrue($result->relationLoaded('friendUser'));
        $this->assertEquals('Jane Smith', $result->friendUser->name);
    }

    public function test_delete_removes_friendship(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friendship = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $result = $this->repository->delete($friendship);

        $this->assertTrue($result);
        $this->assertSoftDeleted('friends', ['id' => $friendship->id]);
    }
}
