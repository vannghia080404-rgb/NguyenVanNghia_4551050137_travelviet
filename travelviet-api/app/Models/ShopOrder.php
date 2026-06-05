<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopOrder extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'order_code', 'total_price', 'shipping_name', 'shipping_phone', 'shipping_address', 'notes', 'status', 'payment_method', 'payment_status', 'payment_transaction_id'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function items() {
        return $this->hasMany(ShopOrderItem::class);
    }
}
