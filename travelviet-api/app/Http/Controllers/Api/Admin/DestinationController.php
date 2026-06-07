<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class DestinationController extends Controller
{
    public function index()
    {
        $destinations = Destination::withCount('tours')->get();
        return response()->json(['success' => true, 'data' => $destinations]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:255',
            'region' => 'nullable|in:north,central,south',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $data = $request->only(['name', 'title', 'description', 'color', 'region']);
        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('destinations', 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $destination = Destination::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo điểm đến thành công',
            'data' => $destination
        ], 201);
    }

    public function show($id)
    {
        $destination = Destination::findOrFail($id);
        return response()->json(['success' => true, 'data' => $destination]);
    }

    public function update(Request $request, $id)
    {
        $destination = Destination::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:255',
            'region' => 'nullable|in:north,central,south',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $data = $request->only(['name', 'title', 'description', 'color', 'region']);
        $data['slug'] = Str::slug($request->name);

        if ($request->hasFile('image')) {
            // Delete old image if exists and it's a local file
            if ($destination->image && str_contains($destination->image, 'storage/')) {
                $oldPath = str_replace(asset('storage/'), '', $destination->image);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('destinations', 'public');
            $data['image'] = asset('storage/' . $path);
        }

        $destination->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật điểm đến thành công',
            'data' => $destination
        ]);
    }

    public function destroy($id)
    {
        $destination = Destination::findOrFail($id);
        
        if ($destination->image && str_contains($destination->image, 'storage/')) {
            $oldPath = str_replace(asset('storage/'), '', $destination->image);
            Storage::disk('public')->delete($oldPath);
        }

        $destination->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa điểm đến thành công'
        ]);
    }
}
