<x-mail::message>
# Xin chào {{ $booking->user->name ?? 'Quý khách' }},

Chúng tôi gửi email này để nhắc nhở bạn về chuyến đi sắp tới cùng **TravelViet**. Chuyến đi của bạn chỉ còn chưa đầy 24 giờ nữa sẽ khởi hành!

---

## 🎒 Thông Tin Chuyến Đi

<x-mail::panel>
| Thông tin | Chi tiết |
|---|---|
| **Tên tour** | {{ $booking->tour->name ?? '—' }} |
| **Ngày khởi hành** | {{ \Carbon\Carbon::parse($booking->departure_date)->format('d/m/Y') }} |
| **Số hành khách** | {{ $booking->num_people }} người |
| **Mã đơn đặt** | {{ $booking->booking_code }} |
</x-mail::panel>

Hãy chuẩn bị hành lý và sẵn sàng cho một trải nghiệm tuyệt vời cùng chúng tôi. 
Nếu bạn cần hỗ trợ gấp, vui lòng liên hệ hotline: **1900 1234**.

Chúc bạn có một chuyến đi vui vẻ,<br>
Đội ngũ **TravelViet**
</x-mail::message>
