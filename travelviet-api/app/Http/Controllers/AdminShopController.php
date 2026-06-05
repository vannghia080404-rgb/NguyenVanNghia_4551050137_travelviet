<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminShopController extends Controller
{
    public function index()
    {
        $products = \App\Models\Product::with('variants')->orderBy('id', 'desc')->get();
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
            foreach($variants as $v) {
                $product->variants()->create($v);
            }
        }

        return response()->json(['success' => true, 'data' => $product->load('variants')]);
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
            $product->variants()->delete();
            foreach($variants as $v) {
                $product->variants()->create($v);
            }
        }

        return response()->json(['success' => true, 'data' => $product->load('variants')]);
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
