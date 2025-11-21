<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function __construct(
        private MessageService $messageService
    ) {}

    /**
     * Display a listing of messages for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $messages = $this->messageService->getAllMessages(Auth::id());

        return response()->json($messages);
    }

    /**
     * Get conversation between authenticated user and a friend.
     */
    public function conversation($friendId): JsonResponse
    {
        $messages = $this->messageService->getConversation(Auth::id(), (int) $friendId);

        return response()->json($messages);
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'content' => 'required|string',
            'type' => 'required|in:text,image',
            'image_url' => 'nullable|string',
            'image_description' => 'nullable|string',
        ]);

        $message = $this->messageService->sendMessage(
            Auth::id(),
            $request->only(['recipient_id', 'content', 'type', 'image_url', 'image_description'])
        );

        return response()->json($message, 201);
    }

    /**
     * Display the specified message.
     */
    public function show(string $id): JsonResponse
    {
        $message = $this->messageService->getMessage(Auth::id(), (int) $id);

        if (!$message) {
            return response()->json(['message' => 'Message not found'], 404);
        }

        return response()->json($message);
    }

    /**
     * Update the specified message.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'content' => 'sometimes|string',
            'status' => 'sometimes|in:sent,delivered,read,expired',
        ]);

        try {
            $message = $this->messageService->updateMessage(
                Auth::id(),
                (int) $id,
                $request->only(['content', 'status'])
            );

            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    /**
     * Mark a message as read.
     */
    public function markAsRead($id): JsonResponse
    {
        try {
            $message = $this->messageService->markAsRead(Auth::id(), (int) $id);

            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    /**
     * Mark an image message as viewed and set expiry.
     */
    public function markImageAsViewed($id): JsonResponse
    {
        try {
            $message = $this->messageService->markImageAsViewed(Auth::id(), (int) $id);

            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove the specified message.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->messageService->deleteMessage(Auth::id(), (int) $id);

            return response()->json(['message' => 'Message deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}
