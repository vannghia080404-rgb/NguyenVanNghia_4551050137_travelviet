<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Mail\BookingReminderMail;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendBookingReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gửi email nhắc nhở cho các đơn đặt tour sẽ khởi hành trong 24h tới';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tomorrow = Carbon::tomorrow()->toDateString();
        
        $bookings = Booking::with(['user', 'tour'])
            ->where('status', 'confirmed')
            ->whereDate('departure_date', $tomorrow)
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            if ($booking->user && $booking->user->email) {
                Mail::to($booking->user->email)->queue(new BookingReminderMail($booking));
                $count++;
            }
        }

        $this->info("Đã đưa {$count} email nhắc nhở vào hàng đợi thành công.");
    }
}
