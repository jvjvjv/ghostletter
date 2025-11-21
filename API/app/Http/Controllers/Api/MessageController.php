<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class MessageController extends Controller
{
    /**
     * Display a listing of messages for the authenticated user.
     */
    public function index()
    {
        $messages = Message::where('sender_id', Auth::id())
            ->orWhere('recipient_id', Auth::id())
            ->with(['sender:id,name,initials,color', 'recipient:id,name,initials,color'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Get conversation between authenticated user and a friend.
     */
    public function conversation($friendId)
    {
        $messages = Message::where(function ($query) use ($friendId) {
            $query->where('sender_id', Auth::id())
                ->where('recipient_id', $friendId);
        })->orWhere(function ($query) use ($friendId) {
            $query->where('sender_id', $friendId)
                ->where('recipient_id', Auth::id());
        })
            ->with(['sender:id,name,initials,color', 'recipient:id,name,initials,color'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'content' => 'required|string',
            'type' => 'required|in:text,image',
            'image_url' => 'nullable|string',
            'image_description' => 'nullable|string',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'content' => $request->content,
            'type' => $request->type,
            'image_url' => $request->image_url,
            'image_description' => $request->image_description,
            'status' => 'sent',
        ]);

        $message->load(['sender:id,name,initials,color', 'recipient:id,name,initials,color']);

        return response()->json($message, 201);
    }

    /**
     * Display the specified message.
     */
    public function show(string $id)
    {
        $message = Message::where(function ($query) {
            $query->where('sender_id', Auth::id())
                ->orWhere('recipient_id', Auth::id());
        })
            ->where('id', $id)
            ->with(['sender:id,name,initials,color', 'recipient:id,name,initials,color'])
            ->firstOrFail();

        return response()->json($message);
    }

    /**
     * Update the specified message.
     */
    public function update(Request $request, string $id)
    {
        $message = Message::where('sender_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $request->validate([
            'content' => 'sometimes|string',
            'status' => 'sometimes|in:sent,delivered,read,expired',
        ]);

        $message->update($request->only(['content', 'status']));

        return response()->json($message);
    }

    /**
     * Mark a message as read.
     */
    public function markAsRead($id)
    {
        $message = Message::where('recipient_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $message->update([
            'is_read' => true,
            'status' => 'read',
        ]);

        return response()->json($message);
    }

    /**
     * Mark an image message as viewed and set expiry.
     */
    public function markImageAsViewed($id)
    {
        $message = Message::where('recipient_id', Auth::id())
            ->where('id', $id)
            ->where('type', 'image')
            ->firstOrFail();

        if (!$message->img_viewed) {
            $expiryTime = Carbon::now()->addSeconds(10); // 10 seconds to view

            $message->update([
                'img_viewed' => true,
                'expiry_timestamp' => $expiryTime,
                'is_read' => true,
            ]);
        }

        return response()->json($message);
    }

    /**
     * Remove the specified message.
     */
    public function destroy(string $id)
    {
        $message = Message::where('sender_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}
