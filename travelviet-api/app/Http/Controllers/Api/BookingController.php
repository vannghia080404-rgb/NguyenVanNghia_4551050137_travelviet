<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\BookingConfirmationMail;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'tour_id' => 'required|exists:tours,id',
            'departure_date' => 'required|date',
            'num_people' => 'required|integer|min:1',
            'payment_method' => 'required|in:vnpay,momo,viettel_money,cash,bank_transfer',
            'travelers' => 'required|array|min:1',
            'travelers.*.full_name' => 'required|string',
            'travelers.*.id_card' => 'required|string',
            'travelers.*.date_of_birth' => 'required|date',
            'travelers.*.phone' => 'required|string',
            'hotel_id' => 'nullable|exists:hotels,id',
        ]);

        $tour = Tour::findOrFail($request->tour_id);

        // Check seat availability
        $bookedSeats = Booking::where('tour_id', $tour->id)
            ->where('departure_date', $request->departure_date)
            ->where('status', '!=', 'cancelled')
            ->sum('num_people');

        if (($bookedSeats + $request->num_people) > $tour->max_slots) {
            return response()->json([
                'success' => false,
                'message' => "Xin lỗi, tour này chỉ còn " . ($tour->max_slots - $bookedSeats) . " chỗ trống cho ngày này."
            ], 400);
        }

        $hotel = null;
        if ($request->hotel_id) {
            $hotel = Hotel::findOrFail($request->hotel_id);
            if ($hotel->available_rooms <= 0) {
                return response()->json([
                    'success' => false,
                    'error_type' => 'no_rooms',
                    'message' => "Xin lỗi, khách sạn này đã hết phòng."
                ], 400);
            }
            if ($hotel->sold_out_dates && in_array($request->departure_date, $hotel->sold_out_dates)) {
                return response()->json([
                    'success' => false,
                    'error_type' => 'no_rooms',
                    'message' => "Xin lỗi, khách sạn này đã hết phòng vào ngày khởi hành này."
                ], 400);
            }
        }

        $totalPrice = $tour->price * $request->num_people;
        if ($hotel) {
            // $tour->duration_days có thể được dùng để tính số đêm, mặc định 1
            $nights = $tour->duration_days ?: 1;
            $totalPrice += $hotel->price_per_night * $nights;
        }

        try {
            DB::beginTransaction();

            if ($hotel) {
                $hotel->decrement('available_rooms');
            }

            $booking = Booking::create([
                'booking_code' => 'BK-' . strtoupper(Str::random(6)),
                'user_id' => $request->user()->id,
                'tour_id' => $tour->id,
                'hotel_id' => $hotel ? $hotel->id : null,
                'departure_date' => $request->departure_date,
                'num_people' => $request->num_people,
                'total_price' => $totalPrice,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
            ]);

            foreach ($request->travelers as $traveler) {
                $booking->travelers()->create($traveler);
            }

            $paymentUrl = null;
            if ($request->payment_method === 'vnpay') {
                $vnpayService = new \App\Services\VNPayService();
                $paymentUrl = $vnpayService->createPaymentUrl([
                    'order_id' => $booking->booking_code,
                    'order_desc' => "Thanh toan booking " . $booking->booking_code,
                    'amount' => $totalPrice,
                    'return_url' => env('VNP_RETURN_URL'),
                ]);
            }

            DB::commit();

            // Gửi email xác nhận đặt tour chạy ngầm sau khi trả kết quả về user (giúp frontend không bị treo)
            try {
                $userEmail = $request->user()->email;
                $bookingId = $booking->id;
                dispatch(function () use ($userEmail, $bookingId) {
                    $b = \App\Models\Booking::with('tour', 'travelers', 'user')->find($bookingId);
                    if ($b) Mail::to($userEmail)->send(new BookingConfirmationMail($b));
                })->afterResponse();
            } catch (\Exception $e) {
                // Ignore mail errors so booking is still successful
                \Log::error('Mail error: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Đặt tour thành công',
                'payment_url' => $paymentUrl,
                'data' => $booking->load('travelers')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi đặt tour: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generatePaymentUrl(Request $request, $booking_code)
    {
        $booking = Booking::where('booking_code', $booking_code)->where('user_id', $request->user()->id)->firstOrFail();
        
        if ($booking->status === 'cancelled') {
            return response()->json(['success' => false, 'message' => 'Đơn hàng đã bị hủy.'], 400);
        }

        if ($booking->payment_status === 'completed') {
            return response()->json(['success' => false, 'message' => 'Đơn hàng đã được thanh toán.'], 400);
        }
        
        if ($request->has('payment_method')) {
            $booking->payment_method = $request->payment_method;
            $booking->save();
        }

        $paymentUrl = null;
        if ($booking->payment_method === 'vnpay') {
            $vnpayService = new \App\Services\VNPayService();
            // Append time to order_id to avoid VNPay duplicate txn error
            $uniqueOrderId = $booking->booking_code . '_' . time();
            $paymentUrl = $vnpayService->createPaymentUrl([
                'order_id' => $uniqueOrderId,
                'order_desc' => "Thanh toan lai booking " . $booking->booking_code,
                'amount' => $booking->total_price,
                'return_url' => env('VNP_RETURN_URL'),
            ]);
            
            // Note: Since we appended time, the callback might need to handle 'BK-XYZ_123456'. 
            // In VNPayController callback, it typically splits by '_' and uses [0].
        }

        return response()->json([
            'success' => true,
            'payment_url' => $paymentUrl
        ]);
    }

    public function myBookings(Request $request)
    {
        $query = Booking::with(['tour.destination', 'travelers']) // Eager load destination and travelers
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        // Optional: filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->get()->map(function($booking) {
            $departureDate = \Carbon\Carbon::parse($booking->departure_date)->startOfDay();
            $today = \Carbon\Carbon::now()->startOfDay();
            $daysUntilDeparture = $today->diffInDays($departureDate, false);
            $booking->canCancel = in_array($booking->status, ['pending', 'contacted']) && $daysUntilDeparture >= 3;
            $booking->canReview = $booking->status === 'completed' && !\App\Models\Review::where('booking_id', $booking->id)->exists();
            return $booking;
        });

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    public function vnpayCallback(Request $request)
    {
        $vnpayService = new \App\Services\VNPayService();
        $isValid = $vnpayService->verifyPayment($request->all());

        if ($isValid && $request->vnp_ResponseCode === '00') {
            $txnRef = $request->vnp_TxnRef;
            $bookingCode = explode('_', $txnRef)[0]; // Extract original BK-... if there is an underscore
            $booking = Booking::where('booking_code', $bookingCode)->first();
            if ($booking) {
                // Ensure total price matches to prevent tampering
                if ($booking->total_price * 100 !== (int)$request->vnp_Amount) {
                    return response()->json(['success' => false, 'message' => 'Số tiền thanh toán không khớp'], 400);
                }

                $booking->update([
                    'payment_status' => 'completed',
                    'status' => 'confirmed'
                ]);

                // Auto update rank based on new spending
                if ($booking->user) {
                    $booking->user->updateRank();
                }

                // Gửi email xác nhận đặt tour (async)
                try {
                    $userEmail = $booking->user->email;
                    $bookingId = $booking->id;
                    dispatch(function () use ($userEmail, $bookingId) {
                        $b = \App\Models\Booking::with('tour', 'travelers', 'user')->find($bookingId);
                        if ($b) Mail::to($userEmail)->send(new BookingConfirmationMail($b));
                    })->afterResponse();
                } catch (\Exception $e) {
                    // Không để lỗi gửi mail ảnh hưởng tới luồng chính
                }
                return redirect(env('FRONTEND_URL') . '/payment-result?status=success&tour=' . urlencode($booking->tour->name) . '&amount=' . $booking->total_price);
            }
        }
        
        // Redirect to a failure page or show an error
        return redirect(env('FRONTEND_URL') . '/payment-result?status=failed');
    }

    public function cancelBooking(Request $request, $booking_code)
    {
        $booking = Booking::where('booking_code', $booking_code)->firstOrFail();

        if ($booking->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['success' => false, 'message' => 'Đơn đặt này đã được hủy trước đó.'], 400);
        }

        if (!in_array($booking->status, ['pending', 'contacted'])) {
            return response()->json(['success' => false, 'message' => 'Không thể tự hủy khi đơn đặt đã được xác nhận hoặc xử lý.'], 400);
        }

        // Kiểm tra ngày khởi hành phải còn ít nhất 3 ngày (TC18/TC19)
        $departureDate = \Carbon\Carbon::parse($booking->departure_date)->startOfDay();
        $today = \Carbon\Carbon::now()->startOfDay();
        $daysUntilDeparture = $today->diffInDays($departureDate, false);

        if ($daysUntilDeparture < 3) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể hủy đặt tour. Chỉ có thể hủy trước ngày khởi hành ít nhất 3 ngày.'
            ], 400);
        }

        DB::transaction(function() use ($booking) {
            $booking->update(['status' => 'cancelled']);
            if ($booking->hotel_id) {
                $hotel = Hotel::find($booking->hotel_id);
                if ($hotel) {
                    $hotel->increment('available_rooms');
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Đơn đặt đã được hủy thành công.',
            'data' => $booking
        ]);
    }

    public function uploadReceipt(Request $request, $booking_code)
    {
        $request->validate([
            'receipt' => 'required|image|max:5120' // max 5MB
        ]);

        $booking = Booking::where('booking_code', $booking_code)->firstOrFail();

        // Check if user owns this booking or is admin/staff
        if ($booking->user_id !== $request->user()->id && !$request->user()->is_admin && !$request->user()->is_staff) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($request->hasFile('receipt')) {
            $file = $request->file('receipt');
            
            // Upload to Cloudinary
            $uploadedUrl = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'travelviet/receipts'
            ])['secure_url'];

            $booking->update([
                'payment_receipt' => $uploadedUrl,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Đã tải lên biên lai thanh toán thành công. Vui lòng chờ xác nhận.',
                'data' => $booking
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Không tìm thấy file.'], 400);
    }
}
