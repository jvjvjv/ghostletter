<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use BSPDX\AuthKit\Traits\HasAuthKit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\LaravelPasskeys\Models\Concerns\HasPasskeys;

class User extends Authenticatable implements HasPasskeys
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasAuthKit, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get all friends for the user
     */
    public function friends(): HasMany
    {
        return $this->hasMany(Friend::class);
    }

    /**
     * Get all messages sent by the user
     */
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get all messages received by the user
     */
    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }

    /**
     * Get all images uploaded by the user
     */
    public function images(): HasMany
    {
        return $this->hasMany(Image::class);
    }
}
