<?php

namespace Tests\Unit\Services;

use App\Models\Image;
use App\Models\User;
use App\Repositories\ImageRepository;
use App\Services\ImageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageServiceTest extends TestCase
{
    use RefreshDatabase;

    private ImageService $service;
    private ImageRepository $repository;
    private bool $hasGd;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new ImageRepository();
        $this->service = new ImageService($this->repository);
        Storage::fake('public');
        $this->hasGd = function_exists('imagecreatetruecolor');
    }

    public function test_upload_image_stores_and_returns_image(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('photo.jpg', 800, 600)
            : UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');

        $result = $this->service->uploadImage($user->id, $file);

        $this->assertInstanceOf(Image::class, $result);
        Storage::disk('public')->assertExists($result->path);
    }

    public function test_upload_image_associates_with_user(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('photo.jpg')
            : UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg');

        $result = $this->service->uploadImage($user->id, $file);

        $this->assertEquals($user->id, $result->user_id);
    }

    public function test_upload_image_stores_dimensions(): void
    {
        if (!$this->hasGd) {
            $this->markTestSkipped('GD extension is required for dimension tests.');
        }

        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('photo.jpg', 1920, 1080);

        $result = $this->service->uploadImage($user->id, $file);

        $this->assertEquals(1920, $result->width);
        $this->assertEquals(1080, $result->height);
    }

    public function test_upload_image_stores_metadata(): void
    {
        $user = User::factory()->create();
        $file = $this->hasGd
            ? UploadedFile::fake()->image('photo.png')
            : UploadedFile::fake()->create('photo.png', 100, 'image/png');

        $result = $this->service->uploadImage($user->id, $file);

        $this->assertEquals('image/png', $result->mime_type);
        $this->assertNotEmpty($result->filename);
        $this->assertGreaterThan(0, $result->size);
    }

    public function test_get_image_returns_image(): void
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

        $result = $this->service->getImage($image->id);

        $this->assertNotNull($result);
        $this->assertEquals($image->id, $result->id);
    }

    public function test_get_image_returns_null_for_nonexistent(): void
    {
        $result = $this->service->getImage(99999);

        $this->assertNull($result);
    }

    public function test_delete_image_soft_deletes(): void
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

        $result = $this->service->deleteImage($image);

        $this->assertTrue($result);
        $this->assertSoftDeleted('images', ['id' => $image->id]);
    }

    public function test_get_user_images_returns_only_user_images(): void
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

        $result = $this->service->getUserImages($user1->id);

        $this->assertCount(2, $result);
        $this->assertTrue($result->every(fn ($img) => $img->user_id === $user1->id));
    }

    public function test_get_user_images_returns_empty_when_no_images(): void
    {
        $user = User::factory()->create();

        $result = $this->service->getUserImages($user->id);

        $this->assertCount(0, $result);
    }
}
