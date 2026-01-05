<?php

namespace Tests\Unit\Models;

use App\Models\Friend;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FriendModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_friend_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friend = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $this->assertInstanceOf(User::class, $friend->user);
        $this->assertEquals($user->id, $friend->user->id);
    }

    public function test_friend_belongs_to_friend_user(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create(['name' => 'Friend Name']);

        $friend = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $this->assertInstanceOf(User::class, $friend->friendUser);
        $this->assertEquals($friendUser->id, $friend->friendUser->id);
        $this->assertEquals('Friend Name', $friend->friendUser->name);
    }

    public function test_friend_uses_soft_deletes(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friend = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $friend->delete();

        $this->assertSoftDeleted('friends', ['id' => $friend->id]);
        $this->assertNotNull(Friend::withTrashed()->find($friend->id));
    }

    public function test_friend_has_correct_fillable(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friend = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $this->assertEquals($user->id, $friend->user_id);
        $this->assertEquals($friendUser->id, $friend->friend_user_id);
    }

    public function test_friend_timestamps_are_set(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friend = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $this->assertNotNull($friend->created_at);
        $this->assertNotNull($friend->updated_at);
    }

    public function test_friend_can_be_restored(): void
    {
        $user = User::factory()->create();
        $friendUser = User::factory()->create();

        $friend = Friend::create([
            'user_id' => $user->id,
            'friend_user_id' => $friendUser->id,
        ]);

        $friend->delete();
        $this->assertSoftDeleted('friends', ['id' => $friend->id]);

        $friend->restore();
        $this->assertNull(Friend::find($friend->id)->deleted_at);
    }
}
