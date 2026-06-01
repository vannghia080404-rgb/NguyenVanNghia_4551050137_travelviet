<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Mail\ContactMail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $adminEmail = 'admin@travelviet.com';
        try {
            // Fetch admin email from global settings if table exists
            $settings = DB::table('settings')->whereIn('key', ['company_email', 'contact_email'])->get()->pluck('value', 'key');
            $adminEmail = $settings['contact_email'] ?? $settings['company_email'] ?? env('MAIL_FROM_ADDRESS', 'admin@travelviet.com');
        } catch (\Exception $e) {
            // Table doesn't exist or DB error, fallback to env variable
            $adminEmail = env('MAIL_FROM_ADDRESS', 'admin@travelviet.com');
        }
        


        try {
            // Gửi email ngay lập tức (không qua queue để user thấy kết quả ngay)
            Mail::to($adminEmail)->send(new ContactMail($request->all()));
            
            return response()->json([
                'success' => true,
                'message' => 'Đã gửi tin nhắn liên hệ thành công.'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Lỗi gửi email liên hệ: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Không thể gửi email lúc này. Vui lòng thử lại sau.'
            ], 500);
        }
    }
}
