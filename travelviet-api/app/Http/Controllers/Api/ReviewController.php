<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function index($tourId)
    {
        $reviews = Review::where('tour_id', $tourId)
            ->with('user:id,name')
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tour_id' => 'required|exists:tours,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|array|max:3',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find an un-reviewed completed booking for this tour
        $availableBooking = \App\Models\Booking::where('user_id', auth()->id())
            ->where('tour_id', $request->tour_id)
            ->where('status', 'completed')
            ->whereNotIn('id', function($query) {
                $query->select('booking_id')
                      ->from('reviews')
                      ->whereNotNull('booking_id');
            })
            ->first();

        if (!$availableBooking) {
            $hasAnyCompleted = \App\Models\Booking::where('user_id', auth()->id())
                ->where('tour_id', $request->tour_id)
                ->where('status', 'completed')
                ->exists();

            if (!$hasAnyCompleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn chỉ có thể đánh giá tour sau khi đã hoàn thành chuyến đi.'
                ], 403);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn đã đánh giá tất cả các chuyến đi của tour này. Hãy đặt thêm tour để tiếp tục đánh giá.'
                ], 403);
            }
        }

        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $images[] = '/storage/' . $path;
            }
        }

        $review = Review::create([
            'user_id' => auth()->id(),
            'tour_id' => $request->tour_id,
            'booking_id' => $availableBooking->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'images' => $images,
            'is_approved' => auth()->user()->is_staff ? true : false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cảm ơn bạn đã đánh giá! Đánh giá đang chờ duyệt từ quản trị viên.',
            'data' => $review
        ]);
    }

    /**
     * Admin methods
     */
    public function adminIndex(Request $request)
    {
        $reviews = Review::with(['user:id,name', 'tour:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_approved' => true]);

        // Recalculate tour rating and reviews count
        $tour = Tour::findOrFail($review->tour_id);
        $approvedReviews = Review::where('tour_id', $tour->id)->where('is_approved', true)->get();
        
        $reviewsCount = $approvedReviews->count();
        $averageRating = $reviewsCount > 0 ? $approvedReviews->avg('rating') : 0;
        
        $tour->update([
            'reviews_count' => $reviewsCount,
            'rating' => round($averageRating, 1)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã duyệt đánh giá thành công.',
            'data' => $review
        ]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'admin_reply' => 'required|string|max:1000'
        ]);

        $review = Review::findOrFail($id);
        $review->update([
            'admin_reply' => $request->admin_reply,
            'replied_at' => now(),
            'is_approved' => true // Tự động duyệt khi admin phản hồi
        ]);

        // Recalculate tour rating and reviews count
        $tour = Tour::findOrFail($review->tour_id);
        $approvedReviews = Review::where('tour_id', $tour->id)->where('is_approved', true)->get();
        
        $reviewsCount = $approvedReviews->count();
        $averageRating = $reviewsCount > 0 ? $approvedReviews->avg('rating') : 0;
        
        $tour->update([
            'reviews_count' => $reviewsCount,
            'rating' => round($averageRating, 1)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã phản hồi đánh giá.',
            'data' => $review
        ]);
    }

    public function updateReview(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string|max:1000'
        ]);

        $review = Review::findOrFail($id);
        $review->update([
            'comment' => $request->comment
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật nội dung đánh giá của khách hàng.',
            'data' => $review
        ]);
    }
}
