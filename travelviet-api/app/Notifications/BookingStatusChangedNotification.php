<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingStatusChangedNotification extends Notification
{
    use Queueable;

    private static array $statusMessages = [
        'confirmed' => [
            'title' => '✅ Đơn đặt tour đã được xác nhận!',
            'message' => 'Đơn đặt tour #{code} của bạn đã được xác nhận. Hẹn gặp bạn trong chuyến đi!',
        ],
        'cancelled' => [
            'title' => '❌ Đơn đặt tour đã bị huỷ',
            'message' => 'Đơn đặt tour #{code} của bạn đã bị huỷ. Liên hệ hỗ trợ nếu bạn cần thêm thông tin.',
        ],
        'completed' => [
            'title' => '🎉 Chuyến đi đã hoàn thành!',
            'message' => 'Tour #{code} đã hoàn thành. Hãy để lại đánh giá của bạn để giúp du khách khác nhé!',
        ],
    ];

    public function __construct(
        public string $bookingCode,
        public string $status
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $template = self::$statusMessages[$this->status] ?? [
            'title' => 'Cập nhật đơn đặt tour',
            'message' => 'Trạng thái đơn #{code} đã được cập nhật.',
        ];

        return [
            'title' => $template['title'],
            'message' => str_replace('{code}', $this->bookingCode, $template['message']),
            'booking_code' => $this->bookingCode,
            'status' => $this->status,
            'icon' => 'booking',
        ];
    }
}
