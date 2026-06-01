<x-mail::message>
# Xác thực tài khoản TravelViet

Chào bạn,

Cảm ơn bạn đã đăng ký tài khoản tại TravelViet. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác thực (OTP) bên dưới:

<x-mail::panel>
# {{ $otp }}
</x-mail::panel>

Mã này sẽ hết hạn sau 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.

Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.

Trân trọng,<br>
Đội ngũ {{ config('app.name') }}
</x-mail::message>
