<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    use HasFactory;

    /**
     * Các trường có thể gán bulk.
     */
    protected $fillable = [
        'name',
        'address',
        'phone',
        'email',
        'contact_person',
        'region',
        'image',
        'status',
        'price_per_night',
        'star',
        'available_rooms',
        'tour_id',
        'is_default',
        'sold_out_dates',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'sold_out_dates' => 'array',
    ];

    /**
     * Mối quan hệ Hotel thuộc Tour.
     */
    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }
}
