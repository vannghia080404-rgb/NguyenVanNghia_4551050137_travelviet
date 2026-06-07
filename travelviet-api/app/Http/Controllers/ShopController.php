<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\CartItem;
use App\Models\ShopOrder;
use App\Models\ShopOrderItem;
use App\Models\Voucher;

class ShopController extends Controller
{
    public function getVouchers(Request $request)
    {
        $query = Voucher::where('is_active', true)
            ->where('is_public', true)
            ->where(function($q) {
                $q->whereNull('valid_to')->orWhere('valid_to', '>=', now());
            })
            ->where(function($q) {
                $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit');
            });

        // Optionally filter by scope (shop or tour or all)
        if ($request->has('scope')) {
            $query->whereIn('scope', [$request->scope, 'all']);
        }

        $vouchers = $query->get();

        // If user is authenticated, check which vouchers are already saved
        if ($request->user('sanctum')) {
            $userId = $request->user('sanctum')->id;
            $savedVoucherIds = \App\Models\UserVoucher::where('user_id', $userId)->pluck('voucher_id')->toArray();
            
            $vouchers = $vouchers->map(function($voucher) use ($savedVoucherIds) {
                $voucher->is_saved = in_array($voucher->id, $savedVoucherIds);
                return $voucher;
            });
        }

        return response()->json(['success' => true, 'data' => $vouchers]);
    }

    public function saveVoucher(Request $request)
    {
        $request->validate(['voucher_id' => 'required|exists:vouchers,id']);
        $user = $request->user();
        
        $voucher = Voucher::findOrFail($request->voucher_id);

        if (!$voucher->is_active || ($voucher->valid_to && now() > $voucher->valid_to)) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá không còn hoạt động hoặc đã hết hạn.'], 400);
        }

        if ($voucher->usage_limit !== null && $voucher->used_count >= $voucher->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết lượt phát hành.'], 400);
        }

        $savedCount = \App\Models\UserVoucher::where('user_id', $user->id)->where('voucher_id', $voucher->id)->count();
        if ($savedCount >= $voucher->user_limit) {
            return response()->json(['success' => false, 'message' => 'Bạn đã lưu tối đa lượt cho mã này.'], 400);
        }

        \App\Models\UserVoucher::create([
            'user_id' => $user->id,
            'voucher_id' => $voucher->id,
            'is_used' => false
        ]);

        return response()->json(['success' => true, 'message' => 'Đã lưu mã thành công!']);
    }

    public function myVouchers(Request $request)
    {
        $vouchers = \App\Models\UserVoucher::where('user_id', $request->user()->id)
            ->where('is_used', false)
            ->with('voucher')
            ->get()
            ->map(function($uv) {
                return $uv->voucher;
            })
            ->filter(function($v) {
                return $v && $v->is_active && (!$v->valid_to || now() <= $v->valid_to);
            })->values();

        return response()->json(['success' => true, 'data' => $vouchers]);
    }

    public function checkVoucher(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $voucher = Voucher::where('code', $request->code)->where('is_active', true)->first();

        if (!$voucher) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'], 400);
        }

        if ($voucher->valid_from && now() < $voucher->valid_from) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá chưa đến ngày áp dụng.'], 400);
        }

        if ($voucher->valid_to && now() > $voucher->valid_to) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết hạn.'], 400);
        }

        if ($voucher->usage_limit !== null && $voucher->used_count >= $voucher->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng.'], 400);
        }

        return response()->json(['success' => true, 'data' => $voucher]);
    }
    public function index(Request $request)
    {
        $query = Product::where('is_active', true)
            ->with(['variants', 'images', 'reviews'])
            ->withCount(['reviews as review_count']);
            
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        
        $products = $query->get()->map(function($product) {
            $product->avg_rating = $product->reviews->avg('rating') ?? 0;
            // Calculate sold count from ShopOrderItem
            $product->sold_count = ShopOrderItem::whereIn('product_variant_id', $product->variants->pluck('id'))->sum('quantity');
            unset($product->reviews); // remove reviews from list to save payload
            return $product;
        });

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->with(['variants', 'images', 'reviews'])
            ->withCount('reviews as review_count')
            ->firstOrFail();
            
        $product->avg_rating = $product->reviews->avg('rating') ?? 0;
        $product->sold_count = ShopOrderItem::whereIn('product_variant_id', $product->variants->pluck('id'))->sum('quantity');
        unset($product->reviews); // reviews are fetched separately via another endpoint
        
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function getCart(Request $request)
    {
        $cart = CartItem::where('user_id', $request->user()->id)
            ->with(['variant.product'])
            ->get();
        return response()->json(['success' => true, 'data' => $cart]);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $item = CartItem::where('user_id', $request->user()->id)
            ->where('product_variant_id', $request->product_variant_id)
            ->first();

        if ($item) {
            $item->quantity += $request->quantity;
            $item->save();
        } else {
            CartItem::create([
                'user_id' => $request->user()->id,
                'product_variant_id' => $request->product_variant_id,
                'quantity' => $request->quantity
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function updateCartItem(Request $request, $id)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);
        $item = CartItem::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        $item->quantity = $request->quantity;
        $item->save();
        return response()->json(['success' => true]);
    }

    public function removeFromCart(Request $request, $id)
    {
        CartItem::where('user_id', $request->user()->id)->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'shipping_name' => 'required',
            'shipping_phone' => 'required',
            'shipping_address' => 'required_if:delivery_method,home_delivery',
            'payment_method' => 'required',
            'delivery_method' => 'required|in:home_delivery,office_pickup',
        ]);

        $cartItems = CartItem::where('user_id', $request->user()->id)->with('variant.product')->get();
        if ($cartItems->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Giỏ hàng trống!'], 400);
        }

        $totalPrice = 0;
        foreach ($cartItems as $item) {
            $price = $item->variant->product->base_price + $item->variant->price_modifier;
            $totalPrice += $price * $item->quantity;
        }

        $shippingFee = 0;
        if ($request->delivery_method === 'home_delivery') {
            $setting = \App\Models\SiteSetting::where('key', 'shop_shipping_fee')->first();
            $shippingFee = $setting ? (float)$setting->value : 30000;
        }

        $discountAmount = 0;
        $voucherCode = null;

        if ($request->filled('voucher_id')) {
            $userVoucher = \App\Models\UserVoucher::where('user_id', $request->user()->id)
                ->where('voucher_id', $request->voucher_id)
                ->where('is_used', false)
                ->with('voucher')
                ->first();

            if ($userVoucher && $userVoucher->voucher->is_active) {
                $voucher = $userVoucher->voucher;
                
                // Validate time
                $validTime = (!$voucher->valid_from || now() >= $voucher->valid_from) && 
                             (!$voucher->valid_to || now() <= $voucher->valid_to);
                             
                // Validate order value
                $validValue = $totalPrice >= $voucher->min_order_value;
                
                // Validate quantity
                $totalQuantity = $cartItems->sum('quantity');
                $validQuantity = !$voucher->min_quantity || $totalQuantity >= $voucher->min_quantity;
                
                // Validate applies_to
                $validAppliesTo = true;
                if ($voucher->applies_to === 'specific_categories') {
                    // Check if all items belong to allowed categories, or just at least one. Usually "at least one" or sum of allowed items.
                    // For simplicity, we apply discount on the whole order if any item matches, or we calculate discount only on matched items.
                    // I will just check if any item matches.
                    $categories = $voucher->target_ids ?? [];
                    $hasCategory = $cartItems->contains(function($item) use ($categories) {
                        return in_array($item->variant->product->category, $categories);
                    });
                    $validAppliesTo = $hasCategory;
                } else if ($voucher->applies_to === 'specific_products') {
                    $productIds = $voucher->target_ids ?? [];
                    $hasProduct = $cartItems->contains(function($item) use ($productIds) {
                        return in_array($item->variant->product->id, $productIds);
                    });
                    $validAppliesTo = $hasProduct;
                }

                if ($validTime && $validValue && $validQuantity && $validAppliesTo) {
                    if ($voucher->discount_type === 'free_shipping') {
                        $discountAmount = $shippingFee; // fully discount shipping
                        // Ensure max discount is respected if applied to shipping
                        if ($voucher->max_discount) {
                            $discountAmount = min($discountAmount, $voucher->max_discount);
                        }
                    } else if ($voucher->discount_type === 'percent') {
                        $discountAmount = $totalPrice * ($voucher->discount_value / 100);
                        if ($voucher->max_discount) {
                            $discountAmount = min($discountAmount, $voucher->max_discount);
                        }
                    } else {
                        $discountAmount = min($voucher->discount_value, $totalPrice);
                    }
                    $voucherCode = $voucher->code;
                    
                    $voucher->increment('used_count');
                    $userVoucher->is_used = true;
                    $userVoucher->used_at = now();
                    $userVoucher->save();
                }
            }
        }

        $order = ShopOrder::create([
            'user_id' => $request->user()->id,
            'order_code' => 'SHOP' . time() . rand(100, 999),
            'total_price' => $totalPrice,
            'shipping_fee' => $shippingFee,
            'voucher_code' => $voucherCode,
            'discount_amount' => $discountAmount,
            'shipping_name' => $request->shipping_name,
            'shipping_phone' => $request->shipping_phone,
            'shipping_address' => $request->shipping_address ?? '',
            'shipping_lat' => $request->shipping_lat,
            'shipping_lng' => $request->shipping_lng,
            'delivery_method' => $request->delivery_method,
            'notes' => $request->notes,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'payment_status' => 'unpaid'
        ]);

        foreach ($cartItems as $item) {
            $price = $item->variant->product->base_price + $item->variant->price_modifier;
            ShopOrderItem::create([
                'shop_order_id' => $order->id,
                'product_variant_id' => $item->product_variant_id,
                'quantity' => $item->quantity,
                'unit_price' => $price
            ]);
            // Decrease stock
            $item->variant->decrement('stock', $item->quantity);
        }

        CartItem::where('user_id', $request->user()->id)->delete();

        $paymentUrl = null;
        $paymentMethod = \App\Models\PaymentMethod::find($request->payment_method);
        
        if ($paymentMethod && $paymentMethod->type === 'vnpay') {
            $vnpayService = new \App\Services\VNPayService();
            $paymentUrl = $vnpayService->createPaymentUrl([
                'order_id' => $order->order_code,
                'order_desc' => "Thanh toan don hang Shop " . $order->order_code,
                'amount' => $totalPrice - $discountAmount + $shippingFee,
                'return_url' => env('VNP_RETURN_URL'),
            ]);
        }

        return response()->json([
            'success' => true, 
            'order' => $order,
            'payment_url' => $paymentUrl
        ]);
    }

    public function getOrders(Request $request)
    {
        $orders = ShopOrder::where('user_id', $request->user()->id)
            ->with(['items.variant.product', 'trackings', 'paymentMethod'])
            ->orderBy('id', 'desc')
            ->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function uploadReceipt(Request $request, $id)
    {
        $request->validate(['receipt' => 'required|image|mimes:jpeg,png,jpg|max:5120']);
        $order = ShopOrder::where('user_id', $request->user()->id)->findOrFail($id);

        try {
            $uploadedFileUrl = cloudinary()->uploadApi()->upload($request->file('receipt')->getRealPath(), [
                'folder' => 'travelviet/receipts',
            ])['secure_url'];

            $order->payment_receipt = $uploadedFileUrl;
            $order->save();

            return response()->json(['success' => true, 'receipt_url' => $uploadedFileUrl]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi upload ảnh'], 500);
        }
    }

    public function generatePaymentUrl(Request $request, $id)
    {
        $order = ShopOrder::where('user_id', $request->user()->id)->findOrFail($id);
        
        if ($order->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Đơn hàng đã thanh toán'], 400);
        }

        $paymentMethod = \App\Models\PaymentMethod::find($order->payment_method);
        
        if ($paymentMethod && $paymentMethod->type === 'vnpay') {
            $vnpayService = new \App\Services\VNPayService();
            $paymentUrl = $vnpayService->createPaymentUrl([
                'order_id' => $order->order_code,
                'order_desc' => "Thanh toan don hang Shop " . $order->order_code,
                'amount' => $order->total_price - $order->discount_amount + $order->shipping_fee,
                'return_url' => env('VNP_RETURN_URL'),
            ]);
            return response()->json(['success' => true, 'payment_url' => $paymentUrl]);
        }

        return response()->json(['success' => false, 'message' => 'Phương thức thanh toán không hỗ trợ lấy URL trực tiếp'], 400);
    }

    public function cancelOrder(Request $request, $id)
    {
        $request->validate([
            'cancel_reason' => 'required|string|max:255'
        ]);

        $order = ShopOrder::where('user_id', $request->user()->id)->with('items.variant')->findOrFail($id);
        
        if ($order->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Không thể hủy đơn hàng ở trạng thái này'], 400);
        }

        $order->status = 'cancelled';
        $order->cancel_reason = $request->cancel_reason;
        
        if ($order->payment_status === 'paid') {
            $order->payment_status = 'refunded';
        }
        $order->save();

        foreach ($order->items as $item) {
            if ($item->variant) {
                $item->variant->increment('stock', $item->quantity);
            }
        }

        \App\Models\ShopOrderTracking::create([
            'shop_order_id' => $order->id,
            'title' => 'Đã hủy đơn hàng',
            'description' => 'Lý do: ' . $request->cancel_reason,
            'location' => 'Hệ thống'
        ]);

        return response()->json(['success' => true]);
    }

    public function confirmReceived(Request $request, $id)
    {
        $order = ShopOrder::where('user_id', $request->user()->id)->findOrFail($id);
        
        if ($order->status !== 'shipping') {
            return response()->json(['success' => false, 'message' => 'Đơn hàng phải ở trạng thái đang giao mới có thể xác nhận'], 400);
        }

        $order->status = 'completed';
        $order->save();

        \App\Models\ShopOrderTracking::create([
            'shop_order_id' => $order->id,
            'title' => 'Đã nhận được hàng',
            'description' => 'Khách hàng đã xác nhận nhận hàng thành công',
            'location' => 'Người mua'
        ]);

        return response()->json(['success' => true]);
    }
}
