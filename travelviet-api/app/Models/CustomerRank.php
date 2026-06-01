<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerRank extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_spending',
        'discount_percent',
        'badge_icon'
    ];

    public function users()
    {
        return $this->hasMany(User::class, 'rank_id');
    }

    public function promotions()
    {
        return $this->hasMany(Promotion::class, 'required_rank_id');
    }
}
