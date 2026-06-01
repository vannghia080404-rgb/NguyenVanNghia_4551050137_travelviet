<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'destination_id', 'category_id', 'region', 'duration', 'duration_days',
        'price', 'old_price', 'max_slots', 'image', 'badge', 'description',
        'highlights', 'essentials', 'status', 'rating', 'reviews_count',
        'featured', 'map_url', 'included_services', 'excluded_services', 'cancellation_policy'
    ];

    protected $casts = [
        'highlights' => 'array',
        'essentials' => 'array',
        'included_services' => 'array',
        'excluded_services' => 'array',
        'cancellation_policy' => 'array',
    ];

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(TourImage::class);
    }

    public function itineraries()
    {
        return $this->hasMany(Itinerary::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Một tour có nhiều khách sạn đối tác lân cận.
     */
    public function hotels()
    {
        return $this->hasMany(\App\Models\Hotel::class);
    }
}