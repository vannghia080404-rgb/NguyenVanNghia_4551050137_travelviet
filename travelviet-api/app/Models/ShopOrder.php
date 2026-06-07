<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopOrder extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'order_code', 'total_price', 'shipping_fee', 'voucher_code', 'discount_amount', 'shipping_name', 'shipping_phone', 'shipping_address', 'shipping_lat', 'shipping_lng', 'delivery_method', 'notes', 'status', 'payment_method', 'payment_status', 'payment_transaction_id', 'payment_receipt'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function items() {
        return $this->hasMany(ShopOrderItem::class);
    }

    public function trackings() {
        return $this->hasMany(ShopOrderTracking::class)->orderBy('created_at', 'desc');
    }

    public function paymentMethod() {
        return $this->belongsTo(PaymentMethod::class, 'payment_method', 'id');
    }
}
