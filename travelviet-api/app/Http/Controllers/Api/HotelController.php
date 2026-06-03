<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    /**
     * GET /api/tours/{tourId}/hotels
     * Trả về danh sách khách sạn liên kết với tour (chỉ active).
     */
    public function index($tourId)
    {
        $tour = Tour::findOrFail($tourId);

        $hotels = Hotel::where('tour_id', $tourId)
            ->where('status', 'active')
            ->get()
            ->map(function ($hotel) {
                $hotel->distance_km = 0;
                return $hotel;
            });

        return response()->json(['data' => $hotels]);
    }

    /**
     * GET /api/admin/hotels
     * Trả về tất cả khách sạn (dùng cho admin).
     */
    public function all()
    {
        $hotels = Hotel::with('tour:id,name')->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $hotels]);
    }

    /**
     * POST /api/admin/hotels
     * Tạo khách sạn mới (admin).
     */
    public function store(Request $request)
    {
        if ($request->has('sold_out_dates')) {
            if ($request->sold_out_dates === '' || $request->sold_out_dates === null) {
                $request->merge(['sold_out_dates' => []]);
            } elseif (is_string($request->sold_out_dates)) {
                $decoded = json_decode($request->sold_out_dates, true);
                if (is_array($decoded)) {
                    $request->merge(['sold_out_dates' => $decoded]);
                } else {
                    $request->merge(['sold_out_dates' => array_filter(explode(',', $request->sold_out_dates))]);
                }
            }
        }

        $request->validate([
            'name'             => 'required|string|max:255',
            'address'          => 'required|string|max:500',
            'phone'            => 'nullable|string|max:20',
            'email'            => 'nullable|email|max:255',
            'contact_person'   => 'nullable|string|max:255',
            'region'           => 'nullable|string|max:255',
            'status'           => 'nullable|in:active,inactive',
            'price_per_night'  => 'required|numeric|min:0',
            'star'             => 'required|integer|min:1|max:5',
            'available_rooms'  => 'required|integer|min:0',
            'tour_id'          => 'required|exists:tours,id',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_default'       => 'nullable|boolean',
            'sold_out_dates'   => 'nullable|array',
            'sold_out_dates.*' => 'date_format:Y-m-d',
        ]);

        $data = $request->only([
            'name', 'address', 'phone', 'email', 'contact_person',
            'region', 'status', 'price_per_night', 'star', 'available_rooms', 'tour_id', 'is_default', 'sold_out_dates',
        ]);

        if (isset($data['is_default']) && $data['is_default']) {
            Hotel::where('tour_id', $data['tour_id'])->update(['is_default' => false]);
            $data['price_per_night'] = 0; // Default hotel should have 0 extra cost
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $imagePath = cloudinary()->upload($file->getRealPath(), [
                'folder' => 'travelviet/hotels'
            ])->getSecurePath();
            $data['image'] = $imagePath;
        }

        $data['status'] = $data['status'] ?? 'active';

        $hotel = Hotel::create($data);

        return response()->json(['success' => true, 'data' => $hotel->load('tour:id,name')], 201);
    }

    /**
     * PUT /api/admin/hotels/{hotelId}
     * Cập nhật toàn bộ thông tin khách sạn (admin).
     */
    public function update(Request $request, $hotelId)
    {
        \Illuminate\Support\Facades\Log::info('Raw Update Request All: ' . json_encode($request->all()));
        
        if ($request->has('sold_out_dates')) {
            if ($request->sold_out_dates === '' || $request->sold_out_dates === null) {
                $request->merge(['sold_out_dates' => []]);
            } elseif (is_string($request->sold_out_dates)) {
                $decoded = json_decode($request->sold_out_dates, true);
                if (is_array($decoded)) {
                    $request->merge(['sold_out_dates' => $decoded]);
                } else {
                    $request->merge(['sold_out_dates' => array_filter(explode(',', $request->sold_out_dates))]);
                }
            }
        }

        $request->validate([
            'name'             => 'sometimes|string|max:255',
            'address'          => 'sometimes|string|max:500',
            'phone'            => 'nullable|string|max:20',
            'email'            => 'nullable|email|max:255',
            'contact_person'   => 'nullable|string|max:255',
            'region'           => 'nullable|string|max:255',
            'status'           => 'nullable|in:active,inactive',
            'price_per_night'  => 'sometimes|numeric|min:0',
            'star'             => 'sometimes|integer|min:1|max:5',
            'available_rooms'  => 'sometimes|integer|min:0',
            'tour_id'          => 'sometimes|exists:tours,id',
            'image'            => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_default'       => 'nullable|boolean',
            'sold_out_dates'   => 'nullable|array',
            'sold_out_dates.*' => 'date_format:Y-m-d',
        ]);

        $hotel = Hotel::findOrFail($hotelId);

        $data = $request->only([
            'name', 'address', 'phone', 'email', 'contact_person',
            'region', 'status', 'price_per_night', 'star', 'available_rooms', 'tour_id', 'is_default', 'sold_out_dates',
        ]);

        if (isset($data['is_default'])) {
            $data['is_default'] = filter_var($data['is_default'], FILTER_VALIDATE_BOOLEAN);
            if ($data['is_default']) {
                $tourId = $data['tour_id'] ?? $hotel->tour_id;
                Hotel::where('tour_id', $tourId)->where('id', '!=', $hotelId)->update(['is_default' => false]);
                $data['price_per_night'] = 0;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Ignore local delete
            $file = $request->file('image');
            $imagePath = cloudinary()->upload($file->getRealPath(), [
                'folder' => 'travelviet/hotels'
            ])->getSecurePath();
            $data['image'] = $imagePath;
        }

        \Illuminate\Support\Facades\Log::info('Hotel update data: ' . json_encode($data));
        $hotel->update(array_filter($data, fn($v) => $v !== null));

        return response()->json(['success' => true, 'data' => $hotel->fresh('tour:id,name')]);
    }

    /**
     * DELETE /api/admin/hotels/{hotelId}
     * Xóa khách sạn (admin).
     */
    public function destroy($hotelId)
    {
        $hotel = Hotel::findOrFail($hotelId);

        // Delete image if exists
        // Ignore local delete

        $hotel->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa khách sạn.']);
    }
}
