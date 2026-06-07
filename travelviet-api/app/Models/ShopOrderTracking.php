<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopOrderTracking extends Model
{
    protected $fillable = ['shop_order_id', 'title', 'description', 'location', 'image_url', 'lat', 'lng'];

    public function order()
    {
        return $this->belongsTo(ShopOrder::class, 'shop_order_id');
    }
}
