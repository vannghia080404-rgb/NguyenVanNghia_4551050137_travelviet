<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingTraveler extends Model
{
    protected $fillable = ['booking_id', 'full_name', 'id_card', 'date_of_birth', 'phone'];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}