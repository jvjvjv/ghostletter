<?php

namespace App\Services;

use App\Repositories\FriendRepository;
use App\Models\Friend;
use Illuminate\Database\Eloquent\Collection;

class FriendService
{
    public function __construct(
        private FriendRepository $friendRepository
    ) {}

    /**
     * Get all friends for a user
     */
    public function getAllFriends(int $userId): Collection
    {
        return $this->friendRepository->getAllForUser($userId);
    }

    /**
     * Get a simple list of friend users
     */
    public function getFriendsList(int $userId): Collection
    {
        return $this->friendRepository->getAllForUser($userId)
            ->map(fn($friend) => $friend->friendUser);
    }

    /**
     * Get a specific friend
     */
    public function getFriend(int $userId, int $friendshipId): ?Friend
    {
        return $this->friendRepository->findForUser($userId, $friendshipId);
    }

    /**
     * Add a new friend
     *
     * @throws \Exception if friendship already exists
     */
    public function addFriend(int $userId, int $friendUserId): Friend
    {
        // Business logic: Check if friendship already exists
        if ($this->friendRepository->exists($userId, $friendUserId)) {
            throw new \Exception('Friend already added');
        }

        // Business logic: Prevent self-friending
        if ($userId === $friendUserId) {
            throw new \Exception('Cannot add yourself as a friend');
        }

        return $this->friendRepository->create($userId, $friendUserId);
    }

    /**
     * Remove a friend
     *
     * @throws \Exception if friendship not found
     */
    public function removeFriend(int $userId, int $friendshipId): void
    {
        $friend = $this->friendRepository->findForUser($userId, $friendshipId);

        if (!$friend) {
            throw new \Exception('Friend not found');
        }

        $this->friendRepository->delete($friend);
    }
}
