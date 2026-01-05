<?php

namespace App\Http\Controllers\Api;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login and return user data with token
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Find user by username or email
        $user = User::where('username', $request->username)
            ->orWhere('email', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create Sanctum token for API authentication
        $token = $user->createToken('api-token')->plainTextToken;

        // Also log the user in for session-based auth (for cookie support)
        Auth::login($user);

        return response()->json([
            'user' => $this->formatUserResponse($user),
            'token' => $token,
        ]);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        // Revoke all tokens for the authenticated user
        $request->user()?->tokens()->delete();

        // Also logout from session-based auth
        Auth::guard('web')->logout();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Handle user registration using Fortify's CreateNewUser action
     */
    public function register(Request $request, CreateNewUser $creator)
    {
        // Use Fortify's existing CreateNewUser action for validation and user creation
        $user = $creator->create($request->all());

        // Create Sanctum token for API authentication
        $token = $user->createToken('api-token')->plainTextToken;

        // Log the user in for session-based auth
        Auth::login($user);

        return response()->json([
            'user' => $this->formatUserResponse($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Get current authenticated user
     */
    public function user(Request $request)
    {
        return response()->json(
            $this->formatUserResponse($request->user())
        );
    }

    /**
     * Format user data for API response (DRY principle)
     */
    private function formatUserResponse(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'initials' => $user->initials,
            'color' => $user->color,
            'avatar_url' => $user->avatar_url,
        ];
    }
}
