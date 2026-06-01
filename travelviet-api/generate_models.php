<?php
$modelsPath = __DIR__ . '/app/Models';

$models = [
    'Destination' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

    protected \$fillable = ['name', 'slug', 'image', 'description'];

    public function tours()
    {
        return \$this->hasMany(Tour::class);
    }
}
PHP,
    'Category' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected \$fillable = ['name', 'slug', 'description'];

    public function tours()
    {
        return \$this->hasMany(Tour::class);
    }
}
PHP,
    'Tour' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected \$fillable = [
        'name', 'slug', 'destination_id', 'category_id', 'duration', 'duration_days',
        'price', 'old_price', 'max_slots', 'image', 'badge', 'description',
        'highlights', 'essentials', 'status', 'rating', 'reviews_count'
    ];

    protected \$casts = [
        'highlights' => 'array',
        'essentials' => 'array',
    ];

    public function destination()
    {
        return \$this->belongsTo(Destination::class);
    }

    public function category()
    {
        return \$this->belongsTo(Category::class);
    }

    public function images()
    {
        return \$this->hasMany(TourImage::class);
    }

    public function itineraries()
    {
        return \$this->hasMany(Itinerary::class);
    }

    public function bookings()
    {
        return \$this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return \$this->hasMany(Review::class);
    }
}
PHP,
    'TourImage' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourImage extends Model
{
    protected \$fillable = ['tour_id', 'image_path'];

    public function tour()
    {
        return \$this->belongsTo(Tour::class);
    }
}
PHP,
    'Itinerary' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Itinerary extends Model
{
    protected \$fillable = ['tour_id', 'day_number', 'title', 'description', 'meals'];

    public function tour()
    {
        return \$this->belongsTo(Tour::class);
    }
}
PHP,
    'Booking' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected \$fillable = [
        'booking_code', 'user_id', 'tour_id', 'departure_date', 'num_people',
        'total_price', 'status', 'payment_method', 'payment_status'
    ];

    protected \$casts = [
        'departure_date' => 'date',
    ];

    public function user()
    {
        return \$this->belongsTo(User::class);
    }

    public function tour()
    {
        return \$this->belongsTo(Tour::class);
    }

    public function travelers()
    {
        return \$this->hasMany(BookingTraveler::class);
    }

    public function payments()
    {
        return \$this->hasMany(Payment::class);
    }
}
PHP,
    'BookingTraveler' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingTraveler extends Model
{
    protected \$fillable = ['booking_id', 'full_name', 'id_card', 'date_of_birth', 'phone'];

    public function booking()
    {
        return \$this->belongsTo(Booking::class);
    }
}
PHP,
    'Payment' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected \$fillable = [
        'booking_id', 'transaction_no', 'amount', 'bank_code', 'card_type',
        'status', 'payment_data'
    ];

    protected \$casts = [
        'payment_data' => 'array',
    ];

    public function booking()
    {
        return \$this->belongsTo(Booking::class);
    }
}
PHP,
    'Review' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected \$fillable = ['tour_id', 'user_id', 'rating', 'comment'];

    public function tour()
    {
        return \$this->belongsTo(Tour::class);
    }

    public function user()
    {
        return \$this->belongsTo(User::class);
    }
}
PHP,
    'Wishlist' => <<<PHP
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    protected \$fillable = ['user_id', 'tour_id'];

    public function user()
    {
        return \$this->belongsTo(User::class);
    }

    public function tour()
    {
        return \$this->belongsTo(Tour::class);
    }
}
PHP,
];

foreach ($models as $name => $content) {
    file_put_contents($modelsPath . '/' . $name . '.php', $content);
    echo "Created Model: \$name\n";
}

echo "Updating User Model...\n";
$userModelPath = $modelsPath . '/User.php';
$userContent = file_get_contents($userModelPath);

// Add fillable
$userContent = str_replace(
    "'password',",
    "'password',\n        'role',\n        'phone',\n        'address',",
    $userContent
);

// Add relationships
if (strpos($userContent, 'public function bookings()') === false) {
    $relationships = <<<PHP

    public function bookings()
    {
        return \$this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return \$this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return \$this->hasMany(Wishlist::class);
    }
}
PHP;
    $userContent = preg_replace('/}[^}]*$/', $relationships, $userContent);
    file_put_contents($userModelPath, $userContent);
    echo "Updated User Model\n";
}
