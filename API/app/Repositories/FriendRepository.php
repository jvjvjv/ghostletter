<?php

namespace App\Repositories;

use App\Models\Friend;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class FriendRepository
{
    /**
     * Get all friends for a user with pagination
     */
    public function getAllForUser(int $userId, ?int $perPage = null): Collection|LengthAwarePaginator
    {
        $query = Friend::where('user_id', $userId)
            ->with('friendUser:id,name,email,initials,color,avatar_url');

        if ($perPage !== null) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Find a friendship by ID for a user
     */
    public function findForUser(int $userId, int $friendshipId): ?Friend
    {
        return Friend::where('user_id', $userId)
            ->where('id', $friendshipId)
            ->with('friendUser:id,name,email,initials,color,avatar_url')
            ->first();
    }

    /**
     * Check if a friendship exists
     */
    public function exists(int $userId, int $friendUserId): bool
    {
        return Friend::where('user_id', $userId)
            ->where('friend_user_id', $friendUserId)
            ->exists();
    }

    /**
     * Create a new friendship
     */
    public function create(int $userId, int $friendUserId): Friend
    {
        $friend = Friend::create([
            'user_id' => $userId,
            'friend_user_id' => $friendUserId,
        ]);

        $friend->load('friendUser:id,name,email,initials,color,avatar_url');

        return $friend;
    }

    /**
     * Delete a friendship
     */
    public function delete(Friend $friend): bool
    {
        return $friend->delete();
    }
}
