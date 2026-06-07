<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PaymentMethod;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => PaymentMethod::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:bank_transfer,e_wallet,cash',
            'description' => 'nullable|string',
            'account_details' => 'nullable|string',
            'qr_code' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'is_active' => 'boolean'
        ]);

        $data = $request->except('qr_code');

        if ($request->hasFile('qr_code')) {
            $file = $request->file('qr_code');
            $data['qr_code_url'] = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'travelviet/payments'
            ])['secure_url'];
        }

        $method = PaymentMethod::create($data);

        return response()->json(['success' => true, 'data' => $method], 201);
    }

    public function update(Request $request, $id)
    {
        $method = PaymentMethod::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:bank_transfer,e_wallet,cash',
            'description' => 'nullable|string',
            'account_details' => 'nullable|string',
            'qr_code' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'is_active' => 'boolean'
        ]);

        $data = $request->except('qr_code');

        if ($request->hasFile('qr_code')) {
            $file = $request->file('qr_code');
            $data['qr_code_url'] = cloudinary()->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'travelviet/payments'
            ])['secure_url'];
        }

        $method->update($data);

        return response()->json(['success' => true, 'data' => $method]);
    }

    public function destroy($id)
    {
        $method = PaymentMethod::findOrFail($id);
        $method->delete();

        return response()->json(['success' => true, 'message' => 'Payment method deleted']);
    }
}
