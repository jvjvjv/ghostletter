<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FriendService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FriendController extends Controller
{
    public function __construct(
        private FriendService $friendService
    ) {}

    /**
     * Display a listing of the user's friends.
     */
    public function index(): JsonResponse
    {
        $friends = $this->friendService->getAllFriends(Auth::id());

        return response()->json($friends);
    }

    /**
     * Get a simple list of friends with user details
     */
    public function friendsList(): JsonResponse
    {
        $friends = $this->friendService->getFriendsList(Auth::id());

        return response()->json($friends);
    }

    /**
     * Store a newly created friend relationship.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'friend_user_id' => 'required|exists:users,id',
        ]);

        try {
            $friend = $this->friendService->addFriend(
                Auth::id(),
                $request->friend_user_id
            );

            return response()->json($friend, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }
    }

    /**
     * Display the specified friend.
     */
    public function show(string $id): JsonResponse
    {
        $friend = $this->friendService->getFriend(Auth::id(), (int) $id);

        if (!$friend) {
            return response()->json(['message' => 'Friend not found'], 404);
        }

        return response()->json($friend);
    }

    /**
     * Update the specified friend (not typically needed)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        return response()->json(['message' => 'Update not supported for friends'], 405);
    }

    /**
     * Remove the specified friend.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->friendService->removeFriend(Auth::id(), (int) $id);

            return response()->json(['message' => 'Friend removed successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}
