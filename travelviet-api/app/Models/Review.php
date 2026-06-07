<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'tour_id', 'booking_id', 'rating', 'comment', 
        'is_approved', 'admin_reply', 'replied_at', 'images'
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}