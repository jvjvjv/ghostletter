<?php

namespace Tests\Unit\Models;

use App\Models\Image;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImageModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_image_belongs_to_user(): void
    {
        $user = User::factory()->create(['name' => 'Image Owner']);

        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        $this->assertInstanceOf(User::class, $image->user);
        $this->assertEquals($user->id, $image->user->id);
        $this->assertEquals('Image Owner', $image->user->name);
    }

    public function test_image_has_many_messages(): void
    {
        $user = User::factory()->create();
        $recipient1 = User::factory()->create();
        $recipient2 = User::factory()->create();

        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
        ]);

        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $recipient1->id,
            'content' => 'Photo 1',
            'type' => 'image',
            'status' => 'sent',
            'image_id' => $image->id,
        ]);

        Message::create([
            'sender_id' => $user->id,
            'recipient_id' => $recipient2->id,
            'content' => 'Photo 2',
            'type' => 'image',
            'status' => 'sent',
            'image_id' => $image->id,
        ]);

        $this->assertCount(2, $image->messages);
        $this->assertInstanceOf(Message::class, $image->messages->first());
    }

    public function test_image_uses_soft_deletes(): void
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

        $image->delete();

        $this->assertSoftDeleted('images', ['id' => $image->id]);
        $this->assertNotNull(Image::withTrashed()->find($image->id));
    }

    public function test_image_casts_size_to_integer(): void
    {
        $user = User::factory()->create();

        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => '2048',
        ]);

        $this->assertIsInt($image->size);
        $this->assertEquals(2048, $image->size);
    }

    public function test_image_casts_width_to_integer(): void
    {
        $user = User::factory()->create();

        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'width' => '1920',
        ]);

        $this->assertIsInt($image->width);
        $this->assertEquals(1920, $image->width);
    }

    public function test_image_casts_height_to_integer(): void
    {
        $user = User::factory()->create();

        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'height' => '1080',
        ]);

        $this->assertIsInt($image->height);
        $this->assertEquals(1080, $image->height);
    }

    public function test_image_has_correct_fillable(): void
    {
        $user = User::factory()->create();

        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/photo.png',
            'url' => '/storage/images/photo.png',
            'filename' => 'photo.png',
            'mime_type' => 'image/png',
            'size' => 4096,
            'width' => 800,
            'height' => 600,
        ]);

        $this->assertEquals($user->id, $image->user_id);
        $this->assertEquals('images/photo.png', $image->path);
        $this->assertEquals('/storage/images/photo.png', $image->url);
        $this->assertEquals('photo.png', $image->filename);
        $this->assertEquals('image/png', $image->mime_type);
        $this->assertEquals(4096, $image->size);
        $this->assertEquals(800, $image->width);
        $this->assertEquals(600, $image->height);
    }

    public function test_image_timestamps_are_set(): void
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

        $this->assertNotNull($image->created_at);
        $this->assertNotNull($image->updated_at);
    }

    public function test_image_can_be_restored(): void
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

        $image->delete();
        $this->assertSoftDeleted('images', ['id' => $image->id]);

        $image->restore();
        $this->assertNull(Image::find($image->id)->deleted_at);
    }

    public function test_image_dimensions_can_be_null(): void
    {
        $user = User::factory()->create();

        $image = Image::create([
            'user_id' => $user->id,
            'path' => 'images/test.jpg',
            'url' => '/storage/images/test.jpg',
            'filename' => 'test.jpg',
            'mime_type' => 'image/jpeg',
            'size' => 1024,
            'width' => null,
            'height' => null,
        ]);

        $this->assertNull($image->width);
        $this->assertNull($image->height);
    }
}
