<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'code', 'title', 'description', 'scope', 'discount_type', 'discount_value',
        'min_order_value', 'min_quantity', 'max_discount', 'applies_to', 'target_ids',
        'valid_from', 'valid_to', 'usage_limit', 'used_count', 'user_limit',
        'is_public', 'is_active'
    ];

    protected $casts = [
        'target_ids' => 'array',
        'valid_from' => 'datetime',
        'valid_to' => 'datetime',
        'is_public' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function userVouchers()
    {
        return $this->hasMany(UserVoucher::class);
    }
}
