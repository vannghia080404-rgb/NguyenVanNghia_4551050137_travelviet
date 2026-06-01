<?php
use Illuminate\Contracts\Console\Kernel;
use App\Models\Tour;
use App\Models\Itinerary;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$tours = Tour::all();
foreach ($tours as $tour) {
    if ($tour->itineraries()->count() == 0) {
        $itineraries = [
            ['day_number' => 1, 'title' => 'Đón khách & Tham quan', 'description' => 'Xe đón quý khách tại điểm hẹn. Bắt đầu hành trình và tham quan các địa điểm đầu tiên.', 'meals' => 'Trưa, Tối'],
            ['day_number' => 2, 'title' => 'Khám phá & Trải nghiệm', 'description' => 'Khám phá các điểm đến nổi tiếng trong khu vực, thưởng thức đặc sản.', 'meals' => 'Sáng, Trưa, Tối'],
            ['day_number' => 3, 'title' => 'Mua sắm & Tiễn khách', 'description' => 'Tự do mua sắm đặc sản làm quà. Xe đưa quý khách về lại điểm đón ban đầu.', 'meals' => 'Sáng, Trưa'],
        ];
        
        foreach ($itineraries as $itinerary) {
            $tour->itineraries()->create($itinerary);
        }
    }
}

echo "Added itineraries to tours\n";
