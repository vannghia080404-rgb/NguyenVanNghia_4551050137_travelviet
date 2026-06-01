<?php

use App\Models\Tour;
use App\Models\Review;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Recalculating tour ratings and review counts...\n";

$tours = Tour::all();

foreach ($tours as $tour) {
    $avgRating = Review::where('tour_id', $tour->id)->where('is_approved', true)->avg('rating');
    $count = Review::where('tour_id', $tour->id)->where('is_approved', true)->count();
    
    $tour->update([
        'rating' => $avgRating ?: 5.0, // Default to 5.0 if no reviews
        'reviews_count' => $count
    ]);
    
    echo "Updated Tour ID {$tour->id}: Rating " . ($avgRating ?: 5.0) . ", Count {$count}\n";
}

echo "Done!\n";
