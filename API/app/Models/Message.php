<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'content',
        'type',
        'is_read',
        'status',
        'image_id',
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

    /**
     * Get the image attached to this message
     */
    public function image(): BelongsTo
    {
        return $this->belongsTo(Image::class);
    }
}
