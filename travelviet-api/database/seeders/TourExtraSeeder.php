<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Destination;
use App\Models\Tour;
use App\Models\Category;

class TourExtraSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Thêm các địa danh mới (nếu chưa có)
        $destinations = [
            ['name' => 'Ninh Bình', 'slug' => 'ninh-binh', 'image' => 'https://images.unsplash.com/photo-1598018554490-25611953316b'],
            ['name' => 'Huế', 'slug' => 'hue', 'image' => 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396'],
            ['name' => 'Hội An', 'slug' => 'hoi-an', 'image' => 'https://images.unsplash.com/photo-1555931466-206869b48880'],
            ['name' => 'Nha Trang', 'slug' => 'nha-trang', 'image' => 'https://images.unsplash.com/photo-1589197331516-4d84593e04e6'],
            ['name' => 'Phú Quốc', 'slug' => 'phu-quoc', 'image' => 'https://images.unsplash.com/photo-1589779202435-841f927bb12c'],
            ['name' => 'Phong Nha', 'slug' => 'phong-nha', 'image' => 'https://images.unsplash.com/photo-1616484173745-07f25fd0547f'],
        ];

        foreach ($destinations as $dest) {
            Destination::updateOrCreate(['slug' => $dest['slug']], $dest);
        }

        // 2. Lấy IDs để gán cho tour
        $nbId = Destination::where('slug', 'ninh-binh')->first()->id;
        $hueId = Destination::where('slug', 'hue')->first()->id;
        $haId = Destination::where('slug', 'hoi-an')->first()->id;
        $ntId = Destination::where('slug', 'n nha-trang')->first()?->id ?? 1;
        $pqId = Destination::where('slug', 'phu-quoc')->first()->id;
        $pnId = Destination::where('slug', 'phong-nha')->first()->id;

        // 3. Thêm hàng loạt Tour chất lượng cao
        $tours = [
            [
                'name' => 'Kỳ quan Hạ Long 2 ngày 1 đêm - Tàu 5 sao',
                'slug' => 'ha-long-5-star',
                'destination_id' => 1,
                'category_id' => 1,
                'price' => 2850000,
                'old_price' => 3500000,
                'image' => 'https://images.unsplash.com/photo-1524712245354-2c4e5e7124c1',
                'rating' => 4.9,
                'reviews_count' => 156,
                'featured' => true,
                'duration' => '2 ngày 1 đêm',
                'duration_days' => 2,
                'status' => 'active',
                'description' => 'Khám phá vẻ đẹp kỳ ảo của vịnh Hạ Long trên du thuyền 5 sao sang trọng.'
            ],
            [
                'name' => 'Sapa - Chinh phục đỉnh Fansipan hùng vĩ',
                'slug' => 'sapa-fansipan-high',
                'destination_id' => 2,
                'category_id' => 2,
                'price' => 3450000,
                'old_price' => 4000000,
                'image' => 'https://images.unsplash.com/photo-1504457047772-27faf1c00561',
                'rating' => 4.8,
                'reviews_count' => 92,
                'featured' => true,
                'duration' => '3 ngày 2 đêm',
                'duration_days' => 3,
                'status' => 'active',
                'description' => 'Hành trình chinh phục nóc nhà Đông Dương và khám phá văn hóa bản địa Sapa.'
            ],
            [
                'name' => 'Đà Nẵng - Cầu Vàng - Bà Nà Hills - Hội An',
                'slug' => 'da-nang-premium',
                'destination_id' => 3,
                'category_id' => 1,
                'price' => 4800000,
                'image' => 'https://images.unsplash.com/photo-1559592443-7f87a79f6388',
                'rating' => 4.9,
                'reviews_count' => 245,
                'featured' => true,
                'duration' => '4 ngày 3 đêm',
                'duration_days' => 4,
                'status' => 'active',
                'description' => 'Tour nghỉ dưỡng cao cấp kết hợp khám phá các di sản miền Trung.'
            ],
            [
                'name' => 'Cố đô Huế - Vẻ đẹp trầm mặc',
                'slug' => 'hue-classic',
                'destination_id' => $hueId,
                'category_id' => 3,
                'price' => 2100000,
                'image' => 'https://images.unsplash.com/photo-1599708153386-62bd1f912567',
                'rating' => 4.7,
                'reviews_count' => 58,
                'featured' => true,
                'duration' => '2 ngày 1 đêm',
                'duration_days' => 2,
                'status' => 'active',
                'description' => 'Tìm lại những giá trị lịch sử tại kinh đô cuối cùng của Việt Nam.'
            ],
            [
                'name' => 'Ninh Bình: Tràng An - Hang Múa - Tuyệt Tình Cốc',
                'slug' => 'ninh-binh-adventure',
                'destination_id' => $nbId,
                'category_id' => 2,
                'price' => 1650000,
                'image' => 'https://images.unsplash.com/photo-1610471206121-72f87a8b4198',
                'rating' => 4.8,
                'reviews_count' => 134,
                'featured' => true,
                'duration' => '1 ngày',
                'duration_days' => 1,
                'status' => 'active',
                'description' => 'Hành trình khám phá Hạ Long trên cạn với phong cảnh sơn thủy hữu tình.'
            ],
            [
                'name' => 'Đà Lạt - Thành phố ngàn hoa thơ mộng',
                'slug' => 'da-lat-flower',
                'destination_id' => 4,
                'category_id' => 2,
                'price' => 2750000,
                'image' => 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6',
                'rating' => 4.6,
                'reviews_count' => 110,
                'featured' => true,
                'duration' => '3 ngày 2 đêm',
                'duration_days' => 3,
                'status' => 'active',
                'description' => 'Nghỉ dưỡng tại thành phố ngàn hoa với khí hậu mát mẻ quanh năm.'
            ],
            [
                'name' => 'Khám phá Đảo Ngọc Phú Quốc - Tour 4 đảo',
                'slug' => 'phu-quoc-4-island',
                'destination_id' => $pqId,
                'category_id' => 1,
                'price' => 5200000,
                'image' => 'https://images.unsplash.com/photo-1589779202435-841f927bb12c',
                'rating' => 5.0,
                'reviews_count' => 312,
                'featured' => true,
                'duration' => '4 ngày 3 đêm',
                'duration_days' => 4,
                'status' => 'active',
                'description' => 'Trải nghiệm thiên đường biển đảo với những bãi cát trắng mịn và làn nước trong xanh.'
            ],
            [
                'name' => 'Thám hiểm động Phong Nha - Kẻ Bàng',
                'slug' => 'phong-nha-cave',
                'destination_id' => $pnId,
                'category_id' => 2,
                'price' => 2250000,
                'image' => 'https://images.unsplash.com/photo-1616484173745-07f25fd0547f',
                'rating' => 4.9,
                'reviews_count' => 78,
                'featured' => true,
                'duration' => '2 ngày 1 đêm',
                'duration_days' => 2,
                'status' => 'active',
                'description' => 'Hành trình thám hiểm hang động kỳ vĩ nhất thế giới tại Quảng Bình.'
            ],
        ];

        foreach ($tours as $tour) {
            Tour::updateOrCreate(['slug' => $tour['slug']], $tour);
        }
    }
}
