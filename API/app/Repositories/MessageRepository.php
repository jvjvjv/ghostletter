<?php

namespace App\Repositories;

use App\Models\Message;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class MessageRepository
{
    /**
     * Get all messages for a user (sent or received) with pagination
     */
    public function getAllForUser(int $userId, ?int $perPage = null): Collection|LengthAwarePaginator
    {
        $query = Message::where('sender_id', $userId)
            ->orWhere('recipient_id', $userId)
            ->with(['sender:id,name,initials,color', 'recipient:id,name,initials,color', 'image'])
            ->orderBy('created_at', 'desc');

        if ($perPage !== null) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Get conversation between two users with pagination
     */
    public function getConversation(int $userId, int $friendId, ?int $perPage = null): Collection|LengthAwarePaginator
    {
        $query = Message::where(function ($query) use ($userId, $friendId) {
            $query->where('sender_id', $userId)
                ->where('recipient_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('sender_id', $friendId)
                ->where('recipient_id', $userId);
        })
            ->with(['sender:id,name,initials,color', 'recipient:id,name,initials,color', 'image'])
            ->orderBy('created_at', 'asc');

        if ($perPage !== null) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Find a message by ID that involves a user
     */
    public function findForUser(int $userId, int $messageId): ?Message
    {
        return Message::where(function ($query) use ($userId) {
            $query->where('sender_id', $userId)
                ->orWhere('recipient_id', $userId);
        })
            ->where('id', $messageId)
            ->with(['sender:id,name,initials,color', 'recipient:id,name,initials,color', 'image'])
            ->first();
    }

    /**
     * Find a message by ID where user is the recipient
     */
    public function findForRecipient(int $userId, int $messageId): ?Message
    {
        return Message::where('recipient_id', $userId)
            ->where('id', $messageId)
            ->first();
    }

    /**
     * Find a message by ID where user is the sender
     */
    public function findForSender(int $userId, int $messageId): ?Message
    {
        return Message::where('sender_id', $userId)
            ->where('id', $messageId)
            ->first();
    }

    /**
     * Create a new message
     */
    public function create(array $data): Message
    {
        $message = Message::create($data);
        $message->load(['sender:id,name,initials,color', 'recipient:id,name,initials,color', 'image']);

        return $message;
    }

    /**
     * Update a message
     */
    public function update(Message $message, array $data): Message
    {
        $message->update($data);
        return $message->fresh(['sender:id,name,initials,color', 'recipient:id,name,initials,color', 'image']);
    }

    /**
     * Delete a message
     */
    public function delete(Message $message): bool
    {
        return $message->delete();
    }
}
