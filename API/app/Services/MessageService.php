<?php

namespace App\Services;

use App\Repositories\MessageRepository;
use App\Models\Message;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class MessageService
{
    public function __construct(
        private MessageRepository $messageRepository
    ) {}

    /**
     * Get all messages for a user
     */
    public function getAllMessages(int $userId): Collection
    {
        return $this->messageRepository->getAllForUser($userId);
    }

    /**
     * Get conversation between two users
     */
    public function getConversation(int $userId, int $friendId): Collection
    {
        return $this->messageRepository->getConversation($userId, $friendId);
    }

    /**
     * Get a specific message
     */
    public function getMessage(int $userId, int $messageId): ?Message
    {
        return $this->messageRepository->findForUser($userId, $messageId);
    }

    /**
     * Send a message
     */
    public function sendMessage(int $senderId, array $data): Message
    {
        // Business logic: Set default status
        $messageData = array_merge($data, [
            'sender_id' => $senderId,
            'status' => 'sent',
        ]);

        return $this->messageRepository->create($messageData);
    }

    /**
     * Update a message (sender only)
     *
     * @throws \Exception if message not found or not authorized
     */
    public function updateMessage(int $userId, int $messageId, array $data): Message
    {
        $message = $this->messageRepository->findForSender($userId, $messageId);

        if (!$message) {
            throw new \Exception('Message not found or not authorized');
        }

        return $this->messageRepository->update($message, $data);
    }

    /**
     * Mark a message as read
     *
     * @throws \Exception if message not found or not recipient
     */
    public function markAsRead(int $userId, int $messageId): Message
    {
        $message = $this->messageRepository->findForRecipient($userId, $messageId);

        if (!$message) {
            throw new \Exception('Message not found or not authorized');
        }

        return $this->messageRepository->update($message, [
            'is_read' => true,
            'status' => 'read',
        ]);
    }

    /**
     * Mark an image message as viewed and set expiry
     *
     * @throws \Exception if message not found, not recipient, or not an image
     */
    public function markImageAsViewed(int $userId, int $messageId): Message
    {
        $message = $this->messageRepository->findForRecipient($userId, $messageId);

        if (!$message) {
            throw new \Exception('Message not found or not authorized');
        }

        if ($message->type !== 'image') {
            throw new \Exception('Message is not an image type');
        }

        // Business logic: Only set expiry on first view
        if (!$message->img_viewed) {
            $expiryTime = Carbon::now()->addSeconds(10); // 10 seconds to view

            return $this->messageRepository->update($message, [
                'img_viewed' => true,
                'expiry_timestamp' => $expiryTime,
                'is_read' => true,
            ]);
        }

        return $message;
    }

    /**
     * Delete a message (sender only)
     *
     * @throws \Exception if message not found or not authorized
     */
    public function deleteMessage(int $userId, int $messageId): void
    {
        $message = $this->messageRepository->findForSender($userId, $messageId);

        if (!$message) {
            throw new \Exception('Message not found or not authorized');
        }

        $this->messageRepository->delete($message);
    }
}
