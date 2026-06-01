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
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user has a COMPLETED booking for this booking_id
        $booking = \App\Models\Booking::where('id', $request->booking_id)
            ->where('user_id', auth()->id())
            ->where('tour_id', $request->tour_id)
            ->where('status', 'completed')
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn chỉ có thể đánh giá cho đơn hàng đã hoàn thành.'
            ], 403);
        }

        // Check if this booking was already reviewed
        $existingReview = Review::where('booking_id', $request->booking_id)->first();
        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã đánh giá đơn hàng này rồi.'
            ], 400);
        }

        $review = Review::create([
            'user_id' => auth()->id(),
            'tour_id' => $request->tour_id,
            'booking_id' => $request->booking_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false // Admin needs to approve
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
