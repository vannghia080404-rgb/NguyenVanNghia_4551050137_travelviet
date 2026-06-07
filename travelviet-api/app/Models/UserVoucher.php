<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserVoucher extends Model
{
    protected $fillable = ['user_id', 'voucher_id', 'is_used', 'used_at'];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}
