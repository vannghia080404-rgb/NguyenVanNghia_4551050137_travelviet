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
            'discount_type' => 'required|in:fixed,percent',
            'discount_value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
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
            'discount_type' => 'required|in:fixed,percent',
            'discount_value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'valid_from' => 'nullable|date',
            'valid_to' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
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
