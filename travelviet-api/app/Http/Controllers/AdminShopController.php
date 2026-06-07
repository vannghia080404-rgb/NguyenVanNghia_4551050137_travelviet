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
            $path = $request->file('image')->store('shop', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $product = \App\Models\Product::create($data);
        
        if ($request->has('variants')) {
            $variants = json_decode($request->variants, true);
            foreach($variants as $index => $v) {
                if ($request->hasFile("variant_image_{$index}")) {
                    $path = $request->file("variant_image_{$index}")->store('shop/variants', 'public');
                    $v['image_url'] = '/storage/' . $path;
                }
                $product->variants()->create($v);
            }
        }

        if ($request->hasFile('gallery_images')) {
            foreach($request->file('gallery_images') as $file) {
                $path = $file->store('shop/gallery', 'public');
                $product->images()->create(['image_url' => '/storage/' . $path]);
            }
        }

        return response()->json(['success' => true, 'data' => $product->load(['variants', 'images'])]);
    }

    public function update(Request $request, $id)
    {
        $product = \App\Models\Product::findOrFail($id);
        
        $data = $request->except(['image', 'variants']);
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('shop', 'public');
            $data['image_url'] = '/storage/' . $path;
        }
        
        $product->update($data);

        if ($request->has('variants')) {
            $variants = json_decode($request->variants, true);
            // Quick sync: delete old and create new
            // Note: to preserve existing images if no new file is uploaded, we'll check if the $v['image_url'] is passed from frontend
            $product->variants()->delete();
            foreach($variants as $index => $v) {
                if ($request->hasFile("variant_image_{$index}")) {
                    $path = $request->file("variant_image_{$index}")->store('shop/variants', 'public');
                    $v['image_url'] = '/storage/' . $path;
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
                $path = $file->store('shop/gallery', 'public');
                $product->images()->create(['image_url' => '/storage/' . $path]);
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
        $orders = \App\Models\ShopOrder::with(['user', 'items.variant.product'])->orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,shipping,completed,cancelled']);
        $order = \App\Models\ShopOrder::findOrFail($id);
        $order->status = $request->status;
        $order->save();
        return response()->json(['success' => true]);
    }
}
