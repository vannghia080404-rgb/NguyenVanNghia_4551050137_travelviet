<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'discount_type',
        'discount_value',
        'required_rank_id',
        'is_featured',
        'target_url',
        'start_date',
        'end_date',
        'status',
        'badge'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_featured' => 'boolean',
    ];

    public function requiredRank()
    {
        return $this->belongsTo(CustomerRank::class, 'required_rank_id');
    }
}
