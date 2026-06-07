<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'tour_id',
        'hotel_id',
        'departure_date',
        'num_people',
        'total_price',
        'status',
        'payment_method',
        'payment_status',
        'payment_receipt',
        'payment_receipt_verified_at',
        'admin_notes'
    ];

    protected $casts = [
        'departure_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }

    public function travelers()
    {
        return $this->hasMany(BookingTraveler::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method');
    }
}