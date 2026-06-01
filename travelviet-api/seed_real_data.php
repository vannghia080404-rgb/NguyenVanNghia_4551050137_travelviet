<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Tour;
use App\Models\Promotion;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// 1. Categories
$categoriesData = [
    ['name' => 'Khám phá', 'description' => 'Những chuyến đi mang tính trải nghiệm, khám phá vùng đất mới.'],
    ['name' => 'Sinh thái', 'description' => 'Trải nghiệm du lịch gần gũi với thiên nhiên.'],
    ['name' => 'Biển đảo', 'description' => 'Tận hưởng vẻ đẹp của những bãi biển và hòn đảo hoang sơ.'],
    ['name' => 'Văn hoá', 'description' => 'Khám phá các di sản, nét đẹp văn hóa và lịch sử.'],
    ['name' => 'Nghỉ dưỡng', 'description' => 'Tận hưởng dịch vụ cao cấp, thư giãn tâm hồn.']
];

$categories = [];
foreach ($categoriesData as $cData) {
    $cData['slug'] = Str::slug($cData['name']);
    $categories[$cData['name']] = Category::firstOrCreate(['slug' => $cData['slug']], $cData);
}

// 2. Destinations
$destinationsData = [
    [
        'name' => 'Hà Nội', 'region' => 'north', 'title' => 'Thủ đô ngàn năm văn hiến',
        'description' => 'Trung tâm văn hóa, lịch sử lâu đời của Việt Nam với 36 phố phường.',
        'image' => 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&q=80&w=800',
        'color' => 'from-red-600/20'
    ],
    [
        'name' => 'Hạ Long', 'region' => 'north', 'title' => 'Kỳ quan thiên nhiên thế giới',
        'description' => 'Hàng ngàn hòn đảo đá vôi kỳ vĩ và những hang động tuyệt đẹp.',
        'image' => 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800',
        'color' => 'from-emerald-600/20'
    ],
    [
        'name' => 'Sa Pa', 'region' => 'north', 'title' => 'Thành phố trong sương',
        'description' => 'Những thửa ruộng bậc thang tuyệt đẹp và đỉnh Fansipan hùng vĩ.',
        'image' => 'https://images.unsplash.com/photo-1543333995-a78aea2fee50?auto=format&fit=crop&q=80&w=800',
        'color' => 'from-green-600/20'
    ],
    [
        'name' => 'Đà Nẵng', 'region' => 'central', 'title' => 'Thành phố đáng sống',
        'description' => 'Sự kết hợp hoàn hảo giữa biển xanh, cát trắng và núi non kỳ vĩ.',
        'image' => 'https://images.unsplash.com/photo-1559508551-44bff1de756b?auto=format&fit=crop&q=80&w=800',
        'color' => 'from-blue-600/20'
    ],
    [
        'name' => 'Hội An', 'region' => 'central', 'title' => 'Phố cổ yên bình',
        'description' => 'Những nét kiến trúc cổ kính được bảo tồn qua hàng trăm năm.',
        'image' => 'https://images.unsplash.com/photo-1555921015-c26206080b81?auto=format&fit=crop&q=80&w=800',
        'color' => 'from-yellow-600/20'
    ],
    [
        'name' => 'Đà Lạt', 'region' => 'central', 'title' => 'Thành phố ngàn hoa',
        'description' => 'Khí hậu ôn đới quanh năm, rừng thông và những hồ nước nên thơ.',
        'image' => 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&q=80&w=800',
        'color' => 'from-pink-600/20'
    ],
    [
        'name' => 'Phú Quốc', 'region' => 'south', 'title' => 'Đảo Ngọc',
        'description' => 'Thiên đường nghỉ dưỡng với những bãi biển đẹp nhất Việt Nam.',
        'image' => 'https://images.unsplash.com/photo-1586528116311-ad8ed7444ce2?auto=format&fit=crop&q=80&w=800',
        'color' => 'from-cyan-600/20'
    ]
];

$destinations = [];
foreach ($destinationsData as $dData) {
    $dData['slug'] = Str::slug($dData['name']);
    $destinations[$dData['name']] = Destination::firstOrCreate(['slug' => $dData['slug']], $dData);
}

// 3. Tours
$toursData = [
    [
        'name' => 'Khám phá Vịnh Hạ Long trên Du thuyền 5 sao',
        'destination_name' => 'Hạ Long',
        'category_name' => 'Nghỉ dưỡng',
        'duration' => '2 Ngày 1 Đêm',
        'duration_days' => 2,
        'price' => 2500000,
        'old_price' => 3200000,
        'max_slots' => 20,
        'status' => 'active',
        'featured' => true,
        'description' => 'Trải nghiệm đẳng cấp trên du thuyền 5 sao, tham quan các hang động tuyệt đẹp, chèo kayak trên vịnh và thưởng thức hải sản tươi ngon.',
        'image' => 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800',
        'highlights' => ['Ngủ đêm trên du thuyền sang trọng', 'Chèo Kayak khám phá hang luồn', 'Tham quan Hang Sửng Sốt'],
    ],
    [
        'name' => 'Sapa Mù Sương - Chinh phục đỉnh Fansipan',
        'destination_name' => 'Sa Pa',
        'category_name' => 'Khám phá',
        'duration' => '3 Ngày 2 Đêm',
        'duration_days' => 3,
        'price' => 2800000,
        'old_price' => 3000000,
        'max_slots' => 25,
        'status' => 'active',
        'featured' => true,
        'description' => 'Hành trình đến với thị trấn trong sương, chinh phục đỉnh Fansipan - nóc nhà Đông Dương và giao lưu văn hóa với các dân tộc bản địa.',
        'image' => 'https://images.unsplash.com/photo-1543333995-a78aea2fee50?auto=format&fit=crop&q=80&w=800',
        'highlights' => ['Vé cáp treo Fansipan', 'Tham quan Bản Cát Cát', 'Thưởng thức đặc sản Tây Bắc'],
    ],
    [
        'name' => 'Hành trình Di sản: Đà Nẵng - Hội An - Bà Nà Hills',
        'destination_name' => 'Đà Nẵng',
        'category_name' => 'Văn hoá',
        'duration' => '4 Ngày 3 Đêm',
        'duration_days' => 4,
        'price' => 4500000,
        'old_price' => 5200000,
        'max_slots' => 30,
        'status' => 'active',
        'featured' => true,
        'description' => 'Khám phá dải đất miền Trung với các di sản văn hóa thế giới, trải nghiệm cáp treo Bà Nà Hills và vẻ đẹp lung linh của Phố cổ Hội An.',
        'image' => 'https://images.unsplash.com/photo-1559508551-44bff1de756b?auto=format&fit=crop&q=80&w=800',
        'highlights' => ['Vui chơi tại Sun World Bà Nà Hills', 'Khám phá Phố cổ Hội An về đêm', 'Tắm biển Mỹ Khê'],
    ],
    [
        'name' => 'Thiên đường Đảo Ngọc Phú Quốc',
        'destination_name' => 'Phú Quốc',
        'category_name' => 'Biển đảo',
        'duration' => '3 Ngày 2 Đêm',
        'duration_days' => 3,
        'price' => 3500000,
        'old_price' => 4000000,
        'max_slots' => 20,
        'status' => 'active',
        'featured' => true,
        'description' => 'Tận hưởng kỳ nghỉ dưỡng tuyệt vời tại Phú Quốc với biển xanh, cát trắng, nắng vàng và tham gia tour 4 đảo hấp dẫn.',
        'image' => 'https://images.unsplash.com/photo-1586528116311-ad8ed7444ce2?auto=format&fit=crop&q=80&w=800',
        'highlights' => ['Tour lặn ngắm san hô 4 đảo', 'Tham quan VinWonders Phú Quốc', 'Ngắm hoàng hôn Bãi Trường'],
    ],
    [
        'name' => 'Đà Lạt Mộng Mơ - Thành phố ngàn hoa',
        'destination_name' => 'Đà Lạt',
        'category_name' => 'Sinh thái',
        'duration' => '3 Ngày 2 Đêm',
        'duration_days' => 3,
        'price' => 2200000,
        'old_price' => 2500000,
        'max_slots' => 15,
        'status' => 'active',
        'featured' => false,
        'description' => 'Thư giãn trong không khí se lạnh của Đà Lạt, dạo quanh Hồ Xuân Hương và ngắm nhìn những đồi thông, vườn hoa tuyệt đẹp.',
        'image' => 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&q=80&w=800',
        'highlights' => ['Tham quan Thung lũng Tình Yêu', 'Check-in Quảng trường Lâm Viên', 'Thưởng thức cafe view đồi núi'],
    ]
];

foreach ($toursData as $tData) {
    $tData['slug'] = Str::slug($tData['name']);
    $tData['destination_id'] = $destinations[$tData['destination_name']]->id;
    $tData['category_id'] = $categories[$tData['category_name']]->id;
    
    unset($tData['destination_name'], $tData['category_name']);
    
    // Convert arrays to JSON
    $tData['highlights'] = json_encode($tData['highlights']);
    $tData['essentials'] = json_encode(['CCCD/CMND', 'Kem chống nắng', 'Giày thể thao', 'Mũ/Nón']);
    $tData['included_services'] = json_encode(['Xe đưa đón cao cấp', 'Khách sạn 3-5 sao', 'Ăn uống theo chương trình', 'Hướng dẫn viên nhiệt tình']);
    $tData['excluded_services'] = json_encode(['Chi phí mua sắm cá nhân', 'Tiền tip cho HDV (không bắt buộc)', 'Vé tham quan ngoài chương trình']);
    $tData['cancellation_policy'] = json_encode(['Hủy trước 7 ngày: Hoàn 100%', 'Hủy 3-6 ngày: Hoàn 50%', 'Hủy dưới 3 ngày: Không hoàn tiền']);
    $tData['itineraries'] = json_encode([
        ['day_number' => 1, 'title' => 'Đón khách & Tham quan', 'description' => 'Xe đón quý khách tại điểm hẹn. Bắt đầu hành trình và tham quan các địa điểm đầu tiên.', 'meals' => 'Trưa, Tối'],
        ['day_number' => 2, 'title' => 'Khám phá & Trải nghiệm', 'description' => 'Khám phá các điểm đến nổi tiếng trong khu vực, thưởng thức đặc sản.', 'meals' => 'Sáng, Trưa, Tối'],
        ['day_number' => 3, 'title' => 'Mua sắm & Tiễn khách', 'description' => 'Tự do mua sắm đặc sản làm quà. Xe đưa quý khách về lại điểm đón ban đầu.', 'meals' => 'Sáng, Trưa'],
    ]);

    Tour::firstOrCreate(['slug' => $tData['slug']], $tData);
}

// 4. Promotions
$promotionsData = [
    [
        'title' => 'Chào Hè Rực Rỡ 2026',
        'description' => 'Giảm giá 10% cho các chuyến du lịch giải nhiệt mùa hè. Cùng gia đình tận hưởng kỳ nghỉ tuyệt vời.',
        'discount_type' => 'percent',
        'discount_value' => 10,
        'start_date' => '2026-06-01 00:00:00',
        'end_date' => '2026-08-31 23:59:59',
        'status' => 'active',
        'is_featured' => true,
        'image' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
        'target_url' => '/tours?category=bien-dao'
    ],
    [
        'title' => 'Tri Ân Khách Hàng Thân Thiết',
        'description' => 'Giảm 500.000đ dành cho khách hàng đã từng đặt tour tại TravelViet.',
        'discount_type' => 'fixed_amount',
        'discount_value' => 500000,
        'start_date' => '2026-01-01 00:00:00',
        'end_date' => '2026-12-31 23:59:59',
        'status' => 'active',
        'is_featured' => false,
        'image' => 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800',
        'target_url' => '/tours'
    ]
];

foreach ($promotionsData as $pData) {
    Promotion::firstOrCreate(['title' => $pData['title']], $pData);
}

echo "Data seeded successfully!\n";
