<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Friend extends Model
{
    protected $fillable = [
        'user_id',
        'friend_user_id',
    ];

    /**
     * Get the user who owns this friendship
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the friend user
     */
    public function friendUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'friend_user_id');
    }
}
