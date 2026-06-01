<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'booking_id', 'transaction_no', 'amount', 'bank_code', 'card_type',
        'status', 'payment_data'
    ];

    protected $casts = [
        'payment_data' => 'array',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}