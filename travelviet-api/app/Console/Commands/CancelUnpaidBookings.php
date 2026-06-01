<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CancelUnpaidBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:cancel-unpaid';
    protected $description = 'Auto cancel bookings that are unpaid after 3 hours';

    public function handle()
    {
        $cutoffTime = \Carbon\Carbon::now()->subHours(3);

        $bookings = \App\Models\Booking::where('status', 'pending')
            ->where('payment_status', 'pending')
            ->where('payment_method', '!=', 'cash')
            ->where('created_at', '<=', $cutoffTime)
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            $booking->update([
                'status' => 'cancelled',
                'admin_notes' => trim($booking->admin_notes . "\n[Hệ thống] Tự động hủy đơn do quá 3 giờ không thanh toán.")
            ]);
            $count++;
        }

        $this->info("Successfully cancelled {$count} unpaid bookings.");
    }
}
