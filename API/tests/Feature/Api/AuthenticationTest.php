<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_friends(): void
    {
        $response = $this->getJson('/api/friends');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_messages(): void
    {
        $response = $this->getJson('/api/messages');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_user_endpoint(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ]);
    }

    public function test_authenticated_user_can_access_friends(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/friends');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_access_messages(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/messages');

        $response->assertStatus(200);
    }

    public function test_user_endpoint_returns_correct_user_data(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'name',
                'email',
                'created_at',
                'updated_at',
            ])
            ->assertJsonMissing(['password']);
    }
}
