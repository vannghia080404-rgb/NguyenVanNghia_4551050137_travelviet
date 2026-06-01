<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string',
            'messages.*.text' => 'required|string',
        ]);

        $apiKey = env('GEMINI_API_KEY');
        $systemPrompt = "Bạn là Chuyên viên tư vấn du lịch ảo thế hệ mới của TravelViet (travelviet.vn).
Hãy trò chuyện một cách tự nhiên, thân thiện và ấm áp như một người bạn đồng hành du lịch thực thụ, tránh trả lời rập khuôn như robot.

THÔNG TIN VỀ CÔNG TY BẠN CẦN BIẾT:
- Hotline hỗ trợ: 1900 1234 (phục vụ 24/7).
- Email chính thức: support@travelviet.vn.
- Trụ sở chính: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh.
- Ưu thế: Tour thiết kế cá nhân hóa, hướng dẫn viên chuyên nghiệp bản địa, bảo hiểm trọn gói cao cấp.

QUY TẮC TRÒ CHUYỆN ĐỂ TRỞ NÊN TỰ NHIÊN:
1. XƯNG HÔ: Gọi khách hàng là 'Anh/Chị' hoặc 'Quý khách' và xưng là 'TravelViet' hoặc 'Em'. Hành văn lễ phép nhưng gần gũi.
2. SỰ LINH HOẠT: Không sử dụng các câu mở đầu quá trang nghiêm lặp đi lặp lại. Hãy đi thẳng vào câu hỏi của khách hàng.
3. KỸ NĂNG TƯ VẤN: Nếu khách hỏi về địa điểm du lịch, hãy gợi ý cho họ các điểm đến nổi tiếng kèm theo thời tiết lý tưởng. Chủ động giới thiệu các tour đặc sắc của TravelViet như: Du thuyền vịnh Hạ Long, Khám phá Sapa mờ sương, hay Nghỉ dưỡng biển xanh Phú Quốc.
4. XỬ LÝ KHI KHÔNG CÓ THÔNG TIN: Tuyệt đối không trả lời 'Tôi không biết'. Hãy khéo léo nói: 'Dạ, thông tin chi tiết về phần này em xin phép ghi nhận lại, Anh/Chị có thể để lại số điện thoại hoặc email để em chuyển cho bộ phận chuyên trách phản hồi chính xác nhất cho mình được không ạ?'.
5. TRÌNH BÀY: Sử dụng các biểu tượng cảm xúc (emoji) một cách tinh tế (🌸, ☀️, 🗺️, ✈️) để tin nhắn sinh động. Xuống dòng rõ ràng sau mỗi ý để khách hàng dễ đọc trên điện thoại.";


        $messages = $request->input('messages');
        $contents = array_map(function ($m) {
            return [
                'role' => $m['role'] === 'user' ? 'user' : 'model',
                'parts' => [['text' => $m['text']]],
            ];
        }, $messages);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                        'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
                        'contents' => $contents,
                        'generationConfig' => [
                            'maxOutputTokens' => 1000,
                            'temperature' => 1.0,
                        ],
                    ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại!";
                return response()->json(['reply' => $reply]);
            }

            Log::error('Gemini API Error: ' . $response->body());
            return response()->json(['error' => 'AI connection failed.'], 500);

        } catch (\Exception $e) {
            Log::error('Chatbot Error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
