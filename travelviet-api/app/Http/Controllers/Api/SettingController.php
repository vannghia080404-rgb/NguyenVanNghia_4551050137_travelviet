<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    /**
     * Get all public global settings
     */
    public function getGlobalSettings()
    {
        $settings = Cache::remember('site_settings_global', 600, function () {
            return SiteSetting::pluck('value', 'key')->toArray();
        });

        // Calculate Dynamic Stats
        $destinationsCount = \App\Models\Destination::count();
        $averageRating = \App\Models\Review::where('is_approved', true)->avg('rating');
        if (!$averageRating) $averageRating = 5.0; // Default if no reviews

        // Set default values if not present
        $defaults = [
            'company_name' => 'Công ty Du lịch TravelViet',
            'company_phone' => '1900 1234',
            'company_email' => 'support@travelviet.vn',
            'company_address' => '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
            'company_map' => '',
            'social_facebook' => 'https://facebook.com/travelviet',
            'social_facebook_enabled' => 'true',
            'social_youtube' => 'https://youtube.com/travelviet',
            'social_youtube_enabled' => 'true',
            'social_tiktok' => '',
            'social_tiktok_enabled' => 'false',
            'social_zalo' => '',
            'social_zalo_enabled' => 'false',
            'payment_vnpay_enabled' => 'true',
            'payment_viettel_enabled' => 'true',
            'payment_momo_enabled' => 'false',
            'payment_cash_enabled' => 'true',
            'page_terms' => '<p>Đang cập nhật điều khoản dịch vụ...</p>',
            'page_privacy' => '<p>Đang cập nhật chính sách bảo mật...</p>',
            'page_about' => '<p>Đang cập nhật giới thiệu công ty...</p>',
            'page_faq' => '<p>Đang cập nhật câu hỏi thường gặp...</p>',
            'stat_experience_years' => '10+',
            'stat_happy_customers' => '15.000+',
            'stat_destinations' => $destinationsCount . '+',
            'stat_rating' => round($averageRating, 1) . '/5',
            'shop_shipping_fee' => '30000',
        ];

        return response()->json([
            'success' => true,
            'data' => array_merge($defaults, $settings)
        ]);
    }

    /**
     * Update settings (Admin only)
     */
    public function updateSettings(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => is_array($value) ? json_encode($value) : $value]
            );
        }

        Cache::forget('site_settings_global');

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật cấu hình hệ thống.'
        ]);
    }
}
