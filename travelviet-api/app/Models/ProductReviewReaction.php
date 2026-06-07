<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReviewReaction extends Model
{
    protected $fillable = ['user_id', 'product_review_id', 'type'];
}
