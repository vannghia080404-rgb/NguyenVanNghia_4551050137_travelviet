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
        $query = Product::where('is_active', true)->with(['variants', 'images']);
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function show($slug)
    {
        $product = Product::where('slug', $slug)->with(['variants', 'images'])->firstOrFail();
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

        if ($request->filled('voucher_code')) {
            $voucher = Voucher::where('code', $request->voucher_code)->where('is_active', true)->first();
            if ($voucher && 
               (!$voucher->valid_from || now() >= $voucher->valid_from) && 
               (!$voucher->valid_to || now() <= $voucher->valid_to) &&
               ($voucher->usage_limit === null || $voucher->used_count < $voucher->usage_limit) &&
               $totalPrice >= $voucher->min_order_value) {
                
                if ($voucher->discount_type === 'percent') {
                    $discountAmount = $totalPrice * ($voucher->discount_value / 100);
                    if ($voucher->max_discount) {
                        $discountAmount = min($discountAmount, $voucher->max_discount);
                    }
                } else {
                    $discountAmount = min($voucher->discount_value, $totalPrice);
                }
                $voucherCode = $voucher->code;
                
                $voucher->increment('used_count');
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

        // If VNPay, we could generate payment URL here, but for simplicity we return success and handle payment separately or treat it like COD.
        // To be fully identical to tours, we'd integrate the actual VNPay callback logic, but let's just create the order for now.
        return response()->json(['success' => true, 'order' => $order]);
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
}
