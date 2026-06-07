<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductReview;
use App\Models\Product;
use App\Models\ShopOrder;
use Illuminate\Support\Facades\Validator;

class ShopReviewController extends Controller
{
    public function index(Request $request, $productId)
    {
        $reviews = ProductReview::where('product_id', $productId)
            ->with('user:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($request->user('sanctum')) {
            $userId = $request->user('sanctum')->id;
            $reactions = \App\Models\ProductReviewReaction::where('user_id', $userId)
                ->whereIn('product_review_id', $reviews->pluck('id'))
                ->pluck('type', 'product_review_id');
                
            $reviews->each(function ($review) use ($reactions) {
                $review->user_reaction = $reactions->get($review->id);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|array|max:3',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        // Find an un-reviewed completed order for this product
        $availableOrder = ShopOrder::where('user_id', auth()->id())
            ->where('status', 'completed')
            ->whereHas('items.variant', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            })
            ->whereNotIn('id', function($query) use ($request) {
                $query->select('shop_order_id')
                      ->from('product_reviews')
                      ->where('product_id', $request->product_id)
                      ->whereNotNull('shop_order_id');
            })
            ->first();

        if (!$availableOrder) {
            $hasCompletedOrder = ShopOrder::where('user_id', auth()->id())
                ->where('status', 'completed')
                ->whereHas('items.variant', function ($q) use ($request) {
                    $q->where('product_id', $request->product_id);
                })
                ->exists();

            if (!$hasCompletedOrder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.'
                ], 403);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn đã đánh giá tất cả các lần mua sản phẩm này. Hãy mua thêm để tiếp tục đánh giá.'
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

        $review = ProductReview::create([
            'user_id' => auth()->id(),
            'product_id' => $request->product_id,
            'shop_order_id' => $availableOrder->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'images' => $images,
            'likes' => 0,
            'dislikes' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đánh giá sản phẩm thành công.',
            'data' => $review
        ]);
    }

    private function toggleReaction(Request $request, $id, $type)
    {
        $review = ProductReview::findOrFail($id);
        $userId = $request->user()->id;

        $reaction = \App\Models\ProductReviewReaction::where('user_id', $userId)
            ->where('product_review_id', $id)
            ->first();

        if ($reaction) {
            if ($reaction->type === $type) {
                // Remove reaction
                $reaction->delete();
                $review->decrement($type . 's');
                return response()->json(['success' => true, 'action' => 'removed']);
            } else {
                // Change reaction
                $oldType = $reaction->type;
                $reaction->update(['type' => $type]);
                $review->decrement($oldType . 's');
                $review->increment($type . 's');
                return response()->json(['success' => true, 'action' => 'changed']);
            }
        } else {
            // Add new reaction
            \App\Models\ProductReviewReaction::create([
                'user_id' => $userId,
                'product_review_id' => $id,
                'type' => $type
            ]);
            $review->increment($type . 's');
            return response()->json(['success' => true, 'action' => 'added']);
        }
    }

    public function like(Request $request, $id)
    {
        return $this->toggleReaction($request, $id, 'like');
    }

    public function dislike(Request $request, $id)
    {
        return $this->toggleReaction($request, $id, 'dislike');
    }

    // Admin methods
    public function adminIndex()
    {
        $reviews = ProductReview::with(['user:id,name', 'product:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['admin_reply' => 'required|string|max:1000']);
        $review = ProductReview::findOrFail($id);
        $review->update(['admin_reply' => $request->admin_reply]);

        return response()->json([
            'success' => true,
            'message' => 'Đã phản hồi đánh giá.',
            'data' => $review
        ]);
    }
}
