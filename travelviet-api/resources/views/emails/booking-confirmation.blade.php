<x-mail::message>
# Đặt Tour Thành Công! 🎉

Xin chào **{{ $booking->user->name ?? 'Quý khách' }}**,

Cảm ơn bạn đã tin tưởng và đặt tour tại **TravelViet**. Đơn đặt của bạn đã được xác nhận thành công.

---

## 📋 Thông Tin Đặt Tour

<x-mail::panel>
| Thông tin | Chi tiết |
|---|---|
| **Mã đặt tour** | {{ $booking->booking_code }} |
| **Tên tour** | {{ $booking->tour->name ?? '—' }} |
| **Ngày khởi hành** | {{ \Carbon\Carbon::parse($booking->departure_date)->format('d/m/Y') }} |
| **Số hành khách** | {{ $booking->num_people }} người |
| **Tổng tiền** | {{ number_format($booking->total_price, 0, ',', '.') }} VNĐ |
| **Trạng thái** | {{ $booking->status === 'confirmed' ? '✅ Đã xác nhận' : '⏳ Chờ xác nhận' }} |
</x-mail::panel>

---

## 👥 Danh Sách Hành Khách

@foreach($booking->travelers as $i => $traveler)
**Hành khách {{ $i + 1 }}:** {{ $traveler->full_name }} — CCCD: {{ $traveler->id_card }}
@endforeach

---

Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.

Mã này sẽ **hết hạn sau 15 phút** nếu chưa hoàn tất thanh toán.

Trân trọng,<br>
Đội ngũ **TravelViet**
</x-mail::message>
