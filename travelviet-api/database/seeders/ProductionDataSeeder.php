<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Tour;
use App\Models\Product;

class ProductionDataSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Shop tables
        DB::table('shop_order_items')->truncate();
        DB::table('shop_order_trackings')->truncate();
        DB::table('shop_orders')->truncate();
        DB::table('cart_items')->truncate();
        DB::table('product_variants')->truncate();
        DB::table('product_images')->truncate();
        DB::table('products')->truncate();

        // Tour tables
        DB::table('booking_travelers')->truncate();
        DB::table('bookings')->truncate();
        DB::table('itineraries')->truncate();
        DB::table('tour_images')->truncate();
        DB::table('tours')->truncate();

        // Other tables
        DB::table('destinations')->truncate();
        DB::table('hotels')->truncate();
        DB::table('reviews')->truncate();
        DB::table('wishlists')->truncate();
        DB::table('vouchers')->truncate();
        DB::table('notifications')->truncate();
        DB::table('site_settings')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Settings
        DB::table('site_settings')->insert([
            ['key' => 'site_name', 'value' => 'TravelViet'],
            ['key' => 'contact_email', 'value' => 'contact@travelviet.vn'],
            ['key' => 'contact_phone', 'value' => '0901234567'], // Số mẫu nhưng thật hơn
            ['key' => 'contact_address', 'value' => 'Tầng 5, Tòa nhà TravelViet, Quận 1, TP. Hồ Chí Minh'],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/travelviet'],
            ['key' => 'hero_title', 'value' => 'Khám Phá Vẻ Đẹp Việt Nam'],
            ['key' => 'hero_subtitle', 'value' => 'Trải nghiệm những kỳ nghỉ tuyệt vời cùng TravelViet'],
            ['key' => 'shop_shipping_fee', 'value' => '30000'],
            ['key' => 'terms_of_service', 'value' => "### 1. QUY ĐỊNH ĐẶT TOUR\nKhách hàng cần đặt trước ít nhất 7 ngày. Quý khách thanh toán 100% khi đặt tour hoặc chuyển khoản cọc theo hướng dẫn.\n\n### 2. QUY ĐỊNH HỦY/ĐỔI TOUR\nViệc hủy tour phải được thông báo bằng văn bản hoặc email.\n- Hủy trước 7 ngày: Miễn phí.\n- Hủy trước 3 ngày: Tính phí 50%.\n- Hủy trong vòng 24h: Tính phí 100%."],
            ['key' => 'privacy_policy', 'value' => "### 1. THU THẬP THÔNG TIN\nChúng tôi thu thập họ tên, số điện thoại, email để phục vụ việc đặt dịch vụ.\n\n### 2. BẢO MẬT THÔNG TIN\nTravelViet cam kết không chia sẻ thông tin khách hàng cho bên thứ ba ngoại trừ đối tác hàng không, khách sạn để đặt dịch vụ."],
            ['key' => 'cancellation_policy', 'value' => "### CHÍNH SÁCH HOÀN TIỀN\nTiền hoàn sẽ được chuyển về tài khoản của quý khách trong vòng 3-5 ngày làm việc kể từ ngày xác nhận hủy hợp lệ."],
        ]);

        // 2. Destinations
        $destinations = [
            ['name' => 'Hà Nội', 'slug' => 'ha-noi', 'title' => 'Thủ đô Hà Nội', 'region' => 'Mien Bac', 'description' => 'Thủ đô ngàn năm văn hiến với những hồ nước thơ mộng.', 'image' => null, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sapa', 'slug' => 'sapa', 'title' => 'Thị trấn Sapa', 'region' => 'Mien Bac', 'description' => 'Thị trấn trong sương với những thửa ruộng bậc thang tuyệt đẹp.', 'image' => null, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Đà Nẵng', 'slug' => 'da-nang', 'title' => 'TP Đà Nẵng', 'region' => 'Mien Trung', 'description' => 'Thành phố đáng sống nhất Việt Nam với những bãi biển trải dài.', 'image' => null, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Đà Lạt', 'slug' => 'da-lat', 'title' => 'TP Đà Lạt', 'region' => 'Mien Nam', 'description' => 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm.', 'image' => null, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Phú Quốc', 'slug' => 'phu-quoc', 'title' => 'Đảo ngọc Phú Quốc', 'region' => 'Mien Nam', 'description' => 'Đảo ngọc thiên đường với biển xanh, cát trắng.', 'image' => null, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('destinations')->insert($destinations);

        // 3. Tours
        $tours = [
            ['destination_id' => 1, 'name' => 'Khám Phá Thủ Đô Hà Nội 1 Ngày', 'slug' => 'kham-pha-ha-noi', 'description' => 'Hành trình tham quan các di tích lịch sử nổi tiếng.', 'duration' => '1 ngày', 'duration_days' => 1, 'price' => 850000, 'highlights' => json_encode(["Tham quan Lăng Bác"]), 'essentials' => json_encode(["Trang phục lịch sự"]), 'included_services' => json_encode(["Xe đưa đón"]), 'excluded_services' => json_encode(["Chi phí cá nhân"]), 'cancellation_policy' => json_encode(["Hủy trước 3 ngày: Hoàn 100%"]), 'image' => null, 'status' => 'active', 'featured' => true, 'created_at' => now(), 'updated_at' => now()],
            ['destination_id' => 2, 'name' => 'Chinh Phục Fansipan Sapa 2N1Đ', 'slug' => 'fansipan-sapa', 'description' => 'Tour trải nghiệm Sapa.', 'duration' => '2 Ngày 1 Đêm', 'duration_days' => 2, 'price' => 2200000, 'highlights' => json_encode(["Tham quan Bản Cát Cát"]), 'essentials' => json_encode(["Áo ấm"]), 'included_services' => json_encode(["Khách sạn"]), 'excluded_services' => json_encode(["VAT"]), 'cancellation_policy' => json_encode(["Hủy trước 5 ngày: Hoàn 100%"]), 'image' => null, 'status' => 'active', 'featured' => true, 'created_at' => now(), 'updated_at' => now()],
            ['destination_id' => 3, 'name' => 'Tour Đà Nẵng - Bà Nà Hills - Hội An 3N2Đ', 'slug' => 'da-nang-hoi-an', 'description' => 'Khám phá thành phố biển đáng sống.', 'duration' => '3 Ngày 2 Đêm', 'duration_days' => 3, 'price' => 3500000, 'highlights' => json_encode(["Cầu Vàng"]), 'essentials' => json_encode(["Đồ bơi"]), 'included_services' => json_encode(["Resort 4 sao"]), 'excluded_services' => json_encode(["Chi phí ngoài chương trình"]), 'cancellation_policy' => json_encode(["Hủy trước 7 ngày: Hoàn 100%"]), 'image' => null, 'status' => 'active', 'featured' => true, 'created_at' => now(), 'updated_at' => now()],
            ['destination_id' => 4, 'name' => 'Nghỉ Dưỡng Lãng Mạn Đà Lạt 3N2Đ', 'slug' => 'nghi-duong-da-lat', 'description' => 'Hòa mình vào không khí se lạnh.', 'duration' => '3 Ngày 2 Đêm', 'duration_days' => 3, 'price' => 2800000, 'highlights' => json_encode(["Langbiang"]), 'essentials' => json_encode(["Áo len"]), 'included_services' => json_encode(["Khách sạn trung tâm"]), 'excluded_services' => json_encode(["Vé ngoài"]), 'cancellation_policy' => json_encode(["Hủy trước 7 ngày: Hoàn 100%"]), 'image' => null, 'status' => 'active', 'featured' => true, 'created_at' => now(), 'updated_at' => now()],
            ['destination_id' => 5, 'name' => 'Thiên Đường Biển Đảo Phú Quốc 4N3Đ', 'slug' => 'phu-quoc-4n3d', 'description' => 'Tour nghỉ dưỡng và vui chơi.', 'duration' => '4 Ngày 3 Đêm', 'duration_days' => 4, 'price' => 5500000, 'highlights' => json_encode(["VinWonders"]), 'essentials' => json_encode(["Đồ đi biển"]), 'included_services' => json_encode(["Vé máy bay"]), 'excluded_services' => json_encode(["Thuế VAT"]), 'cancellation_policy' => json_encode(["Hủy trước 15 ngày: Hoàn 100%"]), 'image' => null, 'status' => 'active', 'featured' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('tours')->insert($tours);

        // 4. Hotels
        $hotels = [
            ['name' => 'Hanoi Daewoo Hotel', 'tour_id' => 1, 'price_per_night' => 1500000, 'star' => 5, 'address' => '360 Kim Mã, Ba Đình, Hà Nội', 'image' => null, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sapa Horizon Hotel', 'tour_id' => 2, 'price_per_night' => 1200000, 'star' => 4, 'address' => '97 Phạm Xuân Huân, Sapa', 'image' => null, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Novotel Danang', 'tour_id' => 3, 'price_per_night' => 1800000, 'star' => 5, 'address' => '36 Bạch Đằng, Đà Nẵng', 'image' => null, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Colline Hotel Dalat', 'tour_id' => 4, 'price_per_night' => 1400000, 'star' => 4, 'address' => '10 Phan Bội Châu, Đà Lạt', 'image' => null, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Vinpearl Resort Phú Quốc', 'tour_id' => 5, 'price_per_night' => 2500000, 'star' => 5, 'address' => 'Bãi Dài, Phú Quốc', 'image' => null, 'is_default' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('hotels')->insert($hotels);

        foreach (Tour::all() as $tour) {
            DB::table('itineraries')->insert([
                ['tour_id' => $tour->id, 'day_number' => 1, 'title' => 'Ngày khởi hành & Nhận phòng', 'description' => 'Khởi hành chuyến đi. Nhận phòng khách sạn, nghỉ ngơi và ăn tối tự do.'],
            ]);
        }

        // 5. Products
        $products = [
            ['name' => 'Vali Du Lịch Cao Cấp', 'slug' => 'vali-du-lich', 'description' => 'Vali nhựa dẻo PC chống va đập, bánh xe xoay 360 độ.', 'base_price' => 850000, 'category' => 'vali', 'image_url' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Balo Du Lịch Chống Nước', 'slug' => 'balo-chong-nuoc', 'description' => 'Balo thể thao dung tích lớn, chất liệu vải oxford chống nước.', 'base_price' => 350000, 'category' => 'balo', 'image_url' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Gối Cổ Chữ U Cao Su Non', 'slug' => 'goi-chu-u', 'description' => 'Giúp giảm mỏi cổ khi đi xe, máy bay đường dài.', 'base_price' => 120000, 'category' => 'phu-kien', 'image_url' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Bộ 6 Lọ Chiết Mỹ Phẩm', 'slug' => 'bo-chiet-my-pham', 'description' => 'Tiện lợi mang theo dung dịch, sữa tắm lên máy bay.', 'base_price' => 50000, 'category' => 'phu-kien', 'image_url' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Áo Khoác Gió Siêu Nhẹ', 'slug' => 'ao-khoac-gio', 'description' => 'Áo chống nước nhẹ, cản gió, gọn nhẹ bỏ túi.', 'base_price' => 250000, 'category' => 'thoi-trang', 'image_url' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('products')->insert($products);

        foreach (Product::all() as $product) {
            DB::table('product_variants')->insert([
                ['product_id' => $product->id, 'size' => 'Mặc định', 'color' => 'Đen', 'price_modifier' => 0, 'stock' => 100],
            ]);
        }
    }
}
