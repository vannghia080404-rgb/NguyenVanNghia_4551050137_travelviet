<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Destination;
use App\Models\Category;
use App\Models\Tour;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin & User
        User::create([
            'name' => 'Admin TravelViet',
            'email' => 'admin@travelviet.vn',
            'password' => Hash::make('123456'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Nguyễn Văn Nghĩa',
            'email' => 'nghia@gmail.com',
            'password' => Hash::make('nghia123'),
            'role' => 'user',
        ]);

        // Categories
        $categories = [
            ['name' => 'Khám phá', 'slug' => 'kham-pha'],
            ['name' => 'Nghỉ dưỡng', 'slug' => 'nghi-duong'],
            ['name' => 'Văn hoá', 'slug' => 'van-hoa'],
        ];
        
        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Destinations
        $destinations = [
            ['name' => 'Hạ Long', 'slug' => 'ha-long'],
            ['name' => 'Sapa', 'slug' => 'sapa'],
            ['name' => 'Đà Nẵng', 'slug' => 'da-nang'],
            ['name' => 'Đà Lạt', 'slug' => 'da-lat'],
        ];

        foreach ($destinations as $dest) {
            Destination::create($dest);
        }

        // Tours
        Tour::create([
            'name' => 'Hạ Long Bay: Du thuyền 5 sao & Chèo Kayak',
            'slug' => 'ha-long-bay-du-thuyen-5-sao',
            'destination_id' => 1,
            'category_id' => 2,
            'duration' => '3 ngày 2 đêm',
            'duration_days' => 3,
            'price' => 3500000,
            'old_price' => 4500000,
            'max_slots' => 20,
            'image' => '/src/assets/tour-halong.jpg',
            'badge' => 'Bán chạy nhất',
            'description' => 'Khám phá Di sản Thế giới với dịch vụ chuẩn 5 sao trên du thuyền sang trọng. Thưởng thức hải sản tươi sống và ngắm hoàng hôn tuyệt đẹp trên vịnh.',
            'highlights' => [
                'Nghỉ dưỡng trên du thuyền 5 sao đẳng cấp',
                'Trải nghiệm chèo thuyền Kayak xuyên hang động',
                'Tham gia lớp học nấu ăn và Taichi trên boong tàu',
                'Khám phá Hang Sửng Sốt - hang động đẹp nhất Vịnh'
            ],
            'essentials' => [
                ['label' => 'Phương tiện', 'value' => 'Xe Limousine đưa đón tận nơi'],
                ['label' => 'Khách sạn', 'value' => 'Du thuyền 5 sao (Cabin có ban công)'],
                ['label' => 'Bữa ăn', 'value' => 'Tất cả các bữa ăn trên tàu']
            ],
            'rating' => 4.9,
            'reviews_count' => 128
        ]);

        Tour::create([
            'name' => 'Sapa: Trekking bản làng & Chinh phục Fansipan',
            'slug' => 'sapa-trekking-fansipan',
            'destination_id' => 2,
            'category_id' => 1,
            'duration' => '2 ngày 1 đêm',
            'duration_days' => 2,
            'price' => 2100000,
            'max_slots' => 15,
            'image' => '/src/assets/tour-sapa.jpg',
            'description' => 'Hành trình chinh phục Nóc nhà Đông Dương và trải nghiệm văn hóa độc đáo của đồng bào dân tộc thiểu số vùng Tây Bắc.',
            'rating' => 4.8,
            'reviews_count' => 85
        ]);
        
        Tour::create([
            'name' => 'Đà Nẵng - Hội An - Bà Nà Hills',
            'slug' => 'da-nang-hoi-an-ba-na-hills',
            'destination_id' => 3,
            'category_id' => 1,
            'duration' => '4 ngày 3 đêm',
            'duration_days' => 4,
            'price' => 4800000,
            'old_price' => 5200000,
            'max_slots' => 25,
            'badge' => 'Mới',
            'image' => '/src/assets/tour-danang.jpg',
            'description' => 'Hành trình di sản miền Trung kết hợp vui chơi giải trí tại khu du lịch Bà Nà Hills hàng đầu Việt Nam.',
            'rating' => 4.7,
            'reviews_count' => 210
        ]);
    }
}
