<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'account_details',
        'qr_code_url',
        'is_active',
    ];
}
