<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminShopController extends Controller
{
    public function index()
    {
        $products = \App\Models\Product::with(['variants', 'images'])->orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'base_price' => 'required|numeric',
            'category' => 'required|string',
        ]);

        $data = $request->all();
        $data['slug'] = \Illuminate\Support\Str::slug($request->name) . '-' . time();
        
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $data['image_url'] = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'travelviet/shop'
            ])['secure_url'];
        }

        $product = \App\Models\Product::create($data);
        
        if ($request->has('variants')) {
            $variants = json_decode($request->variants, true);
            foreach($variants as $index => $v) {
                if ($request->hasFile("variant_image_{$index}")) {
                    $file = $request->file("variant_image_{$index}");
                    $v['image_url'] = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                        'folder' => 'travelviet/shop/variants'
                    ])['secure_url'];
                }
                $product->variants()->create($v);
            }
        }

        if ($request->hasFile('gallery_images')) {
            foreach($request->file('gallery_images') as $file) {
                $url = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'travelviet/shop/gallery'
                ])['secure_url'];
                $product->images()->create(['image_url' => $url]);
            }
        }

        return response()->json(['success' => true, 'data' => $product->load(['variants', 'images'])]);
    }

    public function update(Request $request, $id)
    {
        $product = \App\Models\Product::findOrFail($id);
        
        $data = $request->except(['image', 'variants', 'deleted_images', 'gallery_images']);
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $data['image_url'] = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'travelviet/shop'
            ])['secure_url'];
        }
        
        $product->update($data);

        if ($request->has('variants')) {
            $variants = json_decode($request->variants, true);
            // Quick sync: delete old and create new
            // Note: to preserve existing images if no new file is uploaded, we'll check if the $v['image_url'] is passed from frontend
            $product->variants()->delete();
            foreach($variants as $index => $v) {
                if ($request->hasFile("variant_image_{$index}")) {
                    $file = $request->file("variant_image_{$index}");
                    $v['image_url'] = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                        'folder' => 'travelviet/shop/variants'
                    ])['secure_url'];
                }
                $product->variants()->create($v);
            }
        }

        if ($request->has('deleted_images')) {
            $deletedImageIds = json_decode($request->deleted_images, true);
            \App\Models\ProductImage::whereIn('id', $deletedImageIds)->delete();
        }

        if ($request->hasFile('gallery_images')) {
            foreach($request->file('gallery_images') as $file) {
                $url = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'travelviet/shop/gallery'
                ])['secure_url'];
                $product->images()->create(['image_url' => $url]);
            }
        }

        return response()->json(['success' => true, 'data' => $product->load(['variants', 'images'])]);
    }

    public function destroy($id)
    {
        $product = \App\Models\Product::findOrFail($id);
        $product->delete();
        return response()->json(['success' => true]);
    }

    // Shop Order Management
    public function getOrders()
    {
        $orders = \App\Models\ShopOrder::with(['user', 'items.variant.product', 'trackings', 'paymentMethod'])->orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,confirmed,processing,shipping,completed,cancelled']);
        $order = \App\Models\ShopOrder::findOrFail($id);
        $order->status = $request->status;
        $order->save();
        return response()->json(['success' => true]);
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate(['payment_status' => 'required|in:unpaid,paid,refunded']);
        $order = \App\Models\ShopOrder::findOrFail($id);
        $order->payment_status = $request->payment_status;
        $order->save();
        return response()->json(['success' => true]);
    }

    public function addTracking(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'image' => 'nullable|image|max:5120'
        ]);

        $order = \App\Models\ShopOrder::findOrFail($id);
        
        $imageUrl = null;
        if ($request->hasFile('image')) {
            $uploadedFileUrl = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload($request->file('image')->getRealPath(), [
                'folder' => 'travelviet/trackings',
            ])->getSecurePath();
            $imageUrl = $uploadedFileUrl;
        }

        $tracking = $order->trackings()->create([
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'image_url' => $imageUrl
        ]);

        return response()->json(['success' => true, 'data' => $tracking]);
    }
}
