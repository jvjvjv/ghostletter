<?php

namespace Tests\Unit\Repositories;

use App\Models\Image;
use App\Models\User;
use App\Repositories\ImageRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private ImageRepository $repository;
    private bool $hasGd;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new ImageRepository();
        Storage::fake('public');
        $this->hasGd = function_exists('imagecreatetruecolor');
    }

    public function test_create_stores_file_and_creates_record(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('photo.jpg', 800, 600)
            : UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');

        $result = $this->repository->create($user->id, $file);

        $this->assertInstanceOf(Image::class, $result);
        $this->assertEquals($user->id, $result->user_id);
        Storage::disk('public')->assertExists($result->path);
    }

    public function test_create_extracts_image_dimensions(): void
    {
        if (!$this->hasGd) {
            $this->markTestSkipped('GD extension is required for dimension extraction tests.');
        }

        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('photo.jpg', 1920, 1080);

        $result = $this->repository->create($user->id, $file);

        $this->assertEquals(1920, $result->width);
        $this->assertEquals(1080, $result->height);
    }

    public function test_create_stores_correct_metadata(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('my-photo.png', 400, 300)->size(2048)
            : UploadedFile::fake()->create('my-photo.png', 2048, 'image/png');

        $result = $this->repository->create($user->id, $file);

        $this->assertEquals('image/png', $result->mime_type);
        $this->assertStringEndsWith('.png', $result->filename);
        $this->assertGreaterThan(0, $result->size);
    }

    public function test_create_generates_unique_filename(): void
    {
        $user = User::factory()->create();
        $file1 = $this->hasGd
            ? UploadedFile::fake()->image('photo.jpg')
            : UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');
        $file2 = $this->hasGd
            ? UploadedFile::fake()->image('photo.jpg')
            : UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');

        $result1 = $this->repository->create($user->id, $file1);
        $result2 = $this->repository->create($user->id, $file2);

        $this->assertNotEquals($result1->filename, $result2->filename);
    }

    public function test_create_stores_url_path(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('photo.jpg')
            : UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');

        $result = $this->repository->create($user->id, $file);

        $this->assertStringStartsWith('/storage/images/', $result->url);
        $this->assertStringStartsWith('images/', $result->path);
    }

    public function test_find_returns_image(): void
    {
        $user = User::factory()->create();
        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'width' => 800,
            'height' => 600,
        ]);

        $result = $this->repository->find($image->id);

        $this->assertNotNull($result);
        $this->assertEquals($image->id, $result->id);
    }

    public function test_find_returns_null_for_nonexistent(): void
    {
        $result = $this->repository->find(99999);

        $this->assertNull($result);
    }

    public function test_soft_delete_marks_as_deleted(): void
    {
        $user = User::factory()->create();
        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        $result = $this->repository->softDelete($image);

        $this->assertTrue($result);
        $this->assertSoftDeleted('images', ['id' => $image->id]);
    }

    public function test_soft_delete_does_not_remove_file(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('photo.jpg')
            : UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');

        $image = $this->repository->create($user->id, $file);
        $path = $image->path;

        $this->repository->softDelete($image);

        Storage::disk('public')->assertExists($path);
    }

    public function test_get_all_for_user_returns_user_images(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Image::create([
            'user_id' => $user1->id,
            'path' => 'images/test1.jpg',
            'url' => '/storage/images/test1.jpg',
            'filename' => 'test1.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        Image::create([
            'user_id' => $user1->id,
            'path' => 'images/test2.jpg',
            'url' => '/storage/images/test2.jpg',
            'filename' => 'test2.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 2048,
        ]);

        Image::create([
            'user_id' => $user2->id,
            'path' => 'images/test3.jpg',
            'url' => '/storage/images/test3.jpg',
            'filename' => 'test3.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 3072,
        ]);

        $result = $this->repository->getAllForUser($user1->id);

        $this->assertCount(2, $result);
        $this->assertTrue($result->every(fn ($img) => $img->user_id === $user1->id));
    }

    public function test_get_all_for_user_returns_empty_when_no_images(): void
    {
        $user = User::factory()->create();

        $result = $this->repository->getAllForUser($user->id);

        $this->assertCount(0, $result);
    }

    public function test_create_handles_gif_images(): void
    {
        if (!$this->hasGd) {
            $this->markTestSkipped('GD extension is required for GIF image tests.');
        }

        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('animation.gif', 200, 200);

        $result = $this->repository->create($user->id, $file);

        $this->assertEquals('image/gif', $result->mime_type);
        $this->assertStringEndsWith('.gif', $result->filename);
    }

    public function test_create_handles_webp_images(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('photo.webp', 500, 'image/webp');

        $result = $this->repository->create($user->id, $file);

        $this->assertStringEndsWith('.webp', $result->filename);
    }
}
