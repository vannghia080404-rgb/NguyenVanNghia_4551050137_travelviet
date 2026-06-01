<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->with('tour.destination')
            ->get()
            ->pluck('tour');

        return response()->json([
            'success' => true,
            'data' => array_values($wishlist->toArray()),
        ]);
    }

    public function toggle(Request $request, $tourId = null)
    {
        $userId = $request->user()->id;
        $tourId = $tourId ?? $request->tour_id ?? $request->input('tour_id');

        if (!$tourId) {
            return response()->json([
                'success' => false,
                'message' => 'Mã tour không hợp lệ.'
            ], 400);
        }

        $existing = Wishlist::where('user_id', $userId)
            ->where('tour_id', $tourId)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'success' => true,
                'liked' => false,
                'message' => 'Đã xóa khỏi danh sách yêu thích',
            ]);
        }

        $wishlist = Wishlist::create([
            'user_id' => $userId,
            'tour_id' => $tourId,
        ]);

        return response()->json([
            'success' => true,
            'liked' => true,
            'message' => 'Đã thêm vào danh sách yêu thích',
        ]);
    }

    public function destroy(Request $request, $tourId)
    {
        $deleted = Wishlist::where('user_id', $request->user()->id)
            ->where('tour_id', $tourId)
            ->delete();

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy trong danh sách yêu thích.'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa khỏi danh sách yêu thích.',
        ]);
    }

    public function check(Request $request, $tourId)
    {
        $liked = Wishlist::where('user_id', $request->user()->id)
            ->where('tour_id', $tourId)
            ->exists();

        return response()->json(['success' => true, 'liked' => $liked]);
    }
}
