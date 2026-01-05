<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ImageControllerTest extends TestCase
{
    use RefreshDatabase;

    private bool $hasGd;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->hasGd = function_exists('imagecreatetruecolor');
    }

    /**
     * Create an appropriate fake file based on GD availability.
     */
    private function createFakeImage(string $name = 'photo.jpg', int $width = 800, int $height = 600): \Illuminate\Http\Testing\File
    {
        if ($this->hasGd) {
            return UploadedFile::fake()->image($name, $width, $height);
        }
        // Without GD, create a generic file with image mime type
        return UploadedFile::fake()->create($name, 100, 'image/jpeg');
    }

    public function test_upload_stores_image(): void
    {
        $user = User::factory()->create();
        $file = $this->createFakeImage('photo.jpg', 800, 600);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(201);

        $path = $response->json('path');
        Storage::disk('public')->assertExists($path);
    }

    public function test_upload_returns_image_data(): void
    {
        $user = User::factory()->create();
        $file = $this->createFakeImage('photo.jpg', 800, 600);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'user_id',
                'path',
                'url',
                'filename',
                'mime_type',
                'size',
                'width',
                'height',
                'created_at',
                'updated_at',
            ]);
    }

    public function test_upload_validates_file_required(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_upload_validates_file_is_image(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_upload_validates_file_max_size(): void
    {
        $user = User::factory()->create();
        // Create file larger than 10MB (10240 KB)
        $file = UploadedFile::fake()->create('large.jpg', 11000, 'image/jpeg');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_upload_extracts_dimensions(): void
    {
        if (!$this->hasGd) {
            $this->markTestSkipped('GD extension is required for dimension extraction tests.');
        }

        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('photo.jpg', 1920, 1080);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('width', 1920)
            ->assertJsonPath('height', 1080);
    }

    public function test_upload_associates_with_user(): void
    {
        $user = User::factory()->create();
        $file = $this->createFakeImage('photo.jpg');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user_id', $user->id);

        $this->assertDatabaseHas('images', [
            'user_id' => $user->id,
        ]);
    }

    public function test_upload_handles_png_images(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('photo.png', 400, 300)
            : UploadedFile::fake()->create('photo.png', 100, 'image/png');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('mime_type', 'image/png');
    }

    public function test_upload_handles_gif_images(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('animation.gif', 200, 200)
            : UploadedFile::fake()->create('animation.gif', 100, 'image/gif');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('mime_type', 'image/gif');
    }

    public function test_upload_generates_unique_filename(): void
    {
        $user = User::factory()->create();
        $file1 = $this->createFakeImage('photo.jpg');
        $file2 = $this->createFakeImage('photo.jpg');

        Sanctum::actingAs($user);

        $response1 = $this->postJson('/api/images/upload', ['image' => $file1]);
        $response2 = $this->postJson('/api/images/upload', ['image' => $file2]);

        $this->assertNotEquals(
            $response1->json('filename'),
            $response2->json('filename')
        );
    }

    public function test_upload_requires_authentication(): void
    {
        $file = $this->createFakeImage('photo.jpg');

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(401);
    }

    public function test_upload_stores_correct_url_format(): void
    {
        $user = User::factory()->create();
        $file = $this->createFakeImage('photo.jpg');

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/images/upload', [
            'image' => $file,
        ]);

        $response->assertStatus(201);

        $url = $response->json('url');
        $this->assertStringStartsWith('/storage/images/', $url);
    }
}
