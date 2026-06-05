<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopOrderItem extends Model
{
    use HasFactory;
    protected $fillable = ['shop_order_id', 'product_variant_id', 'quantity', 'unit_price'];

    public function order() {
        return $this->belongsTo(ShopOrder::class, 'shop_order_id');
    }

    public function variant() {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
