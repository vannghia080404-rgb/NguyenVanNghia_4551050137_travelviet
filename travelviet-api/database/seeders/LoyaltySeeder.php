<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CustomerRank;
use App\Models\Promotion;

class LoyaltySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Create Ranks
        $dong = CustomerRank::firstOrCreate(
            ['name' => 'Hạng Đồng'],
            ['min_spending' => 0, 'discount_percent' => 0, 'badge_icon' => '🥉']
        );

        $bac = CustomerRank::firstOrCreate(
            ['name' => 'Hạng Bạc'],
            ['min_spending' => 10000000, 'discount_percent' => 5, 'badge_icon' => '🥈']
        );

        $vang = CustomerRank::firstOrCreate(
            ['name' => 'Hạng Vàng'],
            ['min_spending' => 50000000, 'discount_percent' => 10, 'badge_icon' => '🥇']
        );

        $kimcuong = CustomerRank::firstOrCreate(
            ['name' => 'Hạng Kim Cương'],
            ['min_spending' => 100000000, 'discount_percent' => 15, 'badge_icon' => '💎']
        );

        // 2. Create Promotions
        Promotion::firstOrCreate(
            ['title' => 'Sale Chào Hè Nhận Deal Đỉnh'],
            [
                'description' => 'Giảm ngay 20% cho tất cả các Tour biển đảo như Phú Quốc, Nha Trang, Đà Nẵng. Đăng ký ngay để nhận ưu đãi tuyệt vời nhất mùa hè này!',
                'image' => 'https://images.unsplash.com/photo-1540202404-b711c0f00125?q=80&w=1200&auto=format&fit=crop',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'is_featured' => 1,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addMonths(3)
            ]
        );

        Promotion::firstOrCreate(
            ['title' => 'Trải nghiệm Đẳng Cấp Thượng Lưu'],
            [
                'description' => 'Tặng ngay Voucher nghỉ dưỡng resort 5 sao trị giá 2.000.000đ dành riêng cho thành viên Hạng Vàng. Tận hưởng kỳ nghỉ sang trọng bậc nhất.',
                'image' => 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop',
                'discount_type' => 'fixed_amount',
                'discount_value' => 2000000,
                'required_rank_id' => $vang->id,
                'is_featured' => 0,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addMonths(6)
            ]
        );

        Promotion::firstOrCreate(
            ['title' => 'Tích Điểm Nhân Đôi Cùng Hạng Bạc'],
            [
                'description' => 'Chương trình tri ân đặc biệt dành cho khách hàng Hạng Bạc. Nhận ngay nhân đôi điểm tích lũy cho mọi booking tour trong tháng này.',
                'image' => 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop',
                'discount_type' => 'percent',
                'discount_value' => 10,
                'required_rank_id' => $bac->id,
                'is_featured' => 0,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addMonths(1)
            ]
        );

        Promotion::firstOrCreate(
            ['title' => 'Đặc Quyền V.I.P Kim Cương'],
            [
                'description' => 'Khuyến mãi đặc quyền 15% cho khách hàng thân thiết hạng Kim Cương. Miễn phí nâng hạng phòng khách sạn & xe đưa đón sân bay.',
                'image' => 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200&auto=format&fit=crop',
                'discount_type' => 'percent',
                'discount_value' => 15,
                'required_rank_id' => $kimcuong->id,
                'is_featured' => 0,
                'status' => 'active',
                'start_date' => now(),
                'end_date' => now()->addYear()
            ]
        );
    }
}
