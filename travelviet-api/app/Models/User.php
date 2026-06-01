<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'otp',
        'otp_expires_at',
        'google_id',
        'avatar',
        'email_verified_at',
        'total_spent',
        'rank_id',
        'bank_name',
        'bank_account_no',
        'bank_account_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getIsAdminAttribute()
    {
        return $this->role === 'admin';
    }

    public function getIsStaffAttribute()
    {
        return in_array($this->role, ['admin', 'staff']);
    }

    public function rank()
    {
        return $this->belongsTo(CustomerRank::class, 'rank_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * Recalculate total spent and update rank
     */
    public function updateRank()
    {
        // Calculate total completed/paid bookings amount
        $totalSpent = $this->bookings()
            ->where('payment_status', 'completed')
            ->where('status', '!=', 'cancelled')
            ->sum('total_price');

        $this->total_spent = $totalSpent;

        // Find the highest rank the user qualifies for
        $highestRank = \App\Models\CustomerRank::where('min_spending', '<=', $totalSpent)
            ->orderBy('min_spending', 'desc')
            ->first();

        if ($highestRank) {
            $this->rank_id = $highestRank->id;
        }

        $this->save();
    }
}