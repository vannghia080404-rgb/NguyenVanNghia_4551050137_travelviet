<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'slug', 'description', 'base_price', 'category', 'image_url', 'is_active'];

    public function variants() {
        return $this->hasMany(ProductVariant::class);
    }

    public function images() {
        return $this->hasMany(ProductImage::class);
    }

    public function reviews() {
        return $this->hasMany(ProductReview::class);
    }
}
