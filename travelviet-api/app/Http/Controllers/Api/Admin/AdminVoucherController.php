<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;

class AdminVoucherController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'data' => $vouchers]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|unique:vouchers,code',
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'scope' => 'required|in:shop,tour,all',
            'discount_type' => 'required|in:fixed,percent,free_shipping',
            'discount_value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'min_quantity' => 'nullable|integer|min:1',
            'max_discount' => 'nullable|numeric|min:0',
            'applies_to' => 'required|in:all,specific_categories,specific_products,specific_tours',
            'target_ids' => 'nullable|array',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'user_limit' => 'required|integer|min:1',
            'is_public' => 'boolean',
            'is_active' => 'boolean'
        ]);

        $voucher = Voucher::create($data);
        return response()->json(['success' => true, 'data' => $voucher]);
    }

    public function update(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);
        $data = $request->validate([
            'code' => 'required|unique:vouchers,code,' . $id,
            'title' => 'nullable|string',
            'description' => 'nullable|string',
            'scope' => 'required|in:shop,tour,all',
            'discount_type' => 'required|in:fixed,percent,free_shipping',
            'discount_value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'min_quantity' => 'nullable|integer|min:1',
            'max_discount' => 'nullable|numeric|min:0',
            'applies_to' => 'required|in:all,specific_categories,specific_products,specific_tours',
            'target_ids' => 'nullable|array',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
            'user_limit' => 'required|integer|min:1',
            'is_public' => 'boolean',
            'is_active' => 'boolean'
        ]);

        $voucher->update($data);
        return response()->json(['success' => true, 'data' => $voucher]);
    }

    public function destroy($id)
    {
        Voucher::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
