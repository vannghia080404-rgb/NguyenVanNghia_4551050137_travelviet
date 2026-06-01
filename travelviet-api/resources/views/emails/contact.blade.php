<x-mail::message>
# Có một tin nhắn liên hệ mới từ website TravelViet!

Dưới đây là thông tin chi tiết:

**Họ và tên:** {{ $data['name'] }}  
**Email:** {{ $data['email'] }}  
**Tiêu đề:** {{ $data['subject'] }}  

**Nội dung:**  
<x-mail::panel>
{{ $data['message'] }}
</x-mail::panel>

Bạn có thể trả lời trực tiếp email này để phản hồi lại khách hàng (Reply-To đã được cấu hình tự động).

Trân trọng,<br>
Hệ thống {{ config('app.name') }}
</x-mail::message>
