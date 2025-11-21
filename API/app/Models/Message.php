<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'content',
        'type',
        'is_read',
        'status',
        'image_url',
        'image_description',
        'img_viewed',
        'expiry_timestamp',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'img_viewed' => 'boolean',
        'expiry_timestamp' => 'datetime',
    ];

    /**
     * Get the sender of the message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the recipient of the message
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }
}
