<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendController extends Controller
{
    /**
     * Display a listing of the user's friends.
     */
    public function index()
    {
        $friends = Friend::where('user_id', Auth::id())
            ->with('friendUser:id,name,email,initials,color,avatar_url')
            ->get();

        return response()->json($friends);
    }

    /**
     * Get a simple list of friends with user details
     */
    public function friendsList()
    {
        $friends = Friend::where('user_id', Auth::id())
            ->with('friendUser:id,name,email,initials,color,avatar_url')
            ->get()
            ->map(function ($friend) {
                return $friend->friendUser;
            });

        return response()->json($friends);
    }

    /**
     * Store a newly created friend relationship.
     */
    public function store(Request $request)
    {
        $request->validate([
            'friend_user_id' => 'required|exists:users,id',
        ]);

        // Check if friendship already exists
        $existingFriend = Friend::where('user_id', Auth::id())
            ->where('friend_user_id', $request->friend_user_id)
            ->first();

        if ($existingFriend) {
            return response()->json(['message' => 'Friend already added'], 409);
        }

        $friend = Friend::create([
            'user_id' => Auth::id(),
            'friend_user_id' => $request->friend_user_id,
        ]);

        $friend->load('friendUser:id,name,email,initials,color,avatar_url');

        return response()->json($friend, 201);
    }

    /**
     * Display the specified friend.
     */
    public function show(string $id)
    {
        $friend = Friend::where('user_id', Auth::id())
            ->where('id', $id)
            ->with('friendUser:id,name,email,initials,color,avatar_url')
            ->firstOrFail();

        return response()->json($friend);
    }

    /**
     * Update the specified friend (not typically needed)
     */
    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Update not supported for friends'], 405);
    }

    /**
     * Remove the specified friend.
     */
    public function destroy(string $id)
    {
        $friend = Friend::where('user_id', Auth::id())
            ->where('id', $id)
            ->firstOrFail();

        $friend->delete();

        return response()->json(['message' => 'Friend removed successfully']);
    }
}
