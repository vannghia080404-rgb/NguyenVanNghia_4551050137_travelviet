<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use App\Models\TourImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TourController extends Controller
{
    /**
     * Display all tours (admin list)
     */
    public function index(Request $request)
    {
        $query = Tour::with(['destination', 'category', 'images'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $tours = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $tours
        ]);
    }

    /**
     * Get single tour detail
     */
    public function show($id)
    {
        $tour = Tour::with(['destination', 'category', 'images', 'itineraries'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tour
        ]);
    }

    /**
     * Create new tour
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'destination_id' => 'required|exists:destinations,id',
            'category_id' => 'required|exists:categories,id',
            'duration' => 'required|string',
            'duration_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'max_slots' => 'required|integer|min:1',
            'badge' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'description' => 'required|string',
            'highlights' => 'nullable|array',
            'essentials' => 'nullable|array',
            'status' => 'required|in:active,inactive,draft',
            'map_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery' => 'nullable|array|max:10',
            'gallery.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'included_services' => 'nullable|array',
            'excluded_services' => 'nullable|array',
            'cancellation_policy' => 'nullable|array',
            'itineraries' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . Str::slug($request->name) . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('tours', $filename, 'public');
            }

            $slug = Str::slug($request->name);
            $count = Tour::where('slug', 'like', $slug . '%')->count();
            if ($count > 0) {
                $slug = $slug . '-' . ($count + 1);
            }

            $tour = Tour::create([
                'name' => $request->name,
                'slug' => $slug,
                'destination_id' => $request->destination_id,
                'category_id' => $request->category_id,
                'duration' => $request->duration,
                'duration_days' => $request->duration_days,
                'price' => $request->price,
                'old_price' => $request->old_price ?? 0,
                'max_slots' => $request->max_slots,
                'badge' => $request->badge,
                'featured' => $request->has('featured') ? filter_var($request->featured, FILTER_VALIDATE_BOOLEAN) : false,
                'image' => $imagePath ? '/storage/' . $imagePath : null,
                'description' => $request->description,
                'highlights' => $request->highlights ?? [],
                'essentials' => $request->essentials ?? [],
                'included_services' => $request->included_services ?? [],
                'excluded_services' => $request->excluded_services ?? [],
                'cancellation_policy' => $request->cancellation_policy ?? [],
                'status' => $request->status,
                'map_url' => $request->map_url,
                'rating' => 0,
                'reviews_count' => 0
            ]);

            // Sync itineraries
            if ($request->filled('itineraries')) {
                $itinerariesData = json_decode($request->itineraries, true);
                if (is_array($itinerariesData)) {
                    foreach ($itinerariesData as $item) {
                        \App\Models\Itinerary::create([
                            'tour_id' => $tour->id,
                            'day_number' => $item['day_number'] ?? null,
                            'title' => $item['title'] ?? '',
                            'description' => $item['description'] ?? '',
                            'meals' => $item['meals'] ?? '',
                        ]);
                    }
                }
            }

            // Upload gallery images
            if ($request->hasFile('gallery')) {
                foreach ($request->file('gallery') as $file) {
                    $filename = time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
                    $gPath = $file->storeAs('tours', $filename, 'public');
                    TourImage::create([
                        'tour_id' => $tour->id,
                        'image_path' => '/storage/' . $gPath,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tour created successfully',
                'data' => $tour->load(['destination', 'category', 'images'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating tour: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update tour
     */
    public function update(Request $request, $id)
    {
        $tour = Tour::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'destination_id' => 'required|exists:destinations,id',
            'category_id' => 'required|exists:categories,id',
            'duration' => 'required|string',
            'duration_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'max_slots' => 'required|integer|min:1',
            'badge' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'description' => 'required|string',
            'highlights' => 'nullable|array',
            'essentials' => 'nullable|array',
            'status' => 'required|in:active,inactive,draft',
            'map_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'gallery' => 'nullable|array|max:10',
            'gallery.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'existing_gallery' => 'nullable|array',
            'included_services' => 'nullable|array',
            'excluded_services' => 'nullable|array',
            'cancellation_policy' => 'nullable|array',
            'itineraries' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::error('Validation Failed:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Handle image replacement
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($tour->image) {
                    $oldPath = str_replace('/storage/', '', $tour->image);
                    Storage::disk('public')->delete($oldPath);
                }

                $file = $request->file('image');
                $filename = time() . '_' . Str::slug($request->name) . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('tours', $filename, 'public');
                $tour->image = '/storage/' . $imagePath;
            }

            $tour->update([
                'name' => $request->name,
                'destination_id' => $request->destination_id,
                'category_id' => $request->category_id,
                'duration' => $request->duration,
                'duration_days' => $request->duration_days,
                'price' => $request->price,
                'old_price' => $request->old_price ?? 0,
                'max_slots' => $request->max_slots,
                'badge' => $request->badge,
                'featured' => $request->has('featured') ? filter_var($request->featured, FILTER_VALIDATE_BOOLEAN) : false,
                'description' => $request->description,
                'highlights' => $request->highlights ?? [],
                'essentials' => $request->essentials ?? [],
                'included_services' => $request->included_services ?? [],
                'excluded_services' => $request->excluded_services ?? [],
                'cancellation_policy' => $request->cancellation_policy ?? [],
                'status' => $request->status,
                'map_url' => $request->map_url,
            ]);

            // Sync itineraries
            if ($request->filled('itineraries')) {
                $itinerariesData = json_decode($request->itineraries, true);
                if (is_array($itinerariesData)) {
                    $tour->itineraries()->delete(); // Remove old ones
                    foreach ($itinerariesData as $item) {
                        \App\Models\Itinerary::create([
                            'tour_id' => $tour->id,
                            'day_number' => $item['day_number'] ?? null,
                            'title' => $item['title'] ?? '',
                            'description' => $item['description'] ?? '',
                            'meals' => $item['meals'] ?? '',
                        ]);
                    }
                }
            }

            // Handle gallery images
            $existingGallery = $request->existing_gallery ?? [];
            
            // Delete removed images
            foreach ($tour->images as $img) {
                if (!in_array($img->image_path, $existingGallery)) {
                    $oldPath = str_replace('/storage/', '', $img->image_path);
                    Storage::disk('public')->delete($oldPath);
                    $img->delete();
                }
            }

            // Upload new gallery images
            if ($request->hasFile('gallery')) {
                foreach ($request->file('gallery') as $file) {
                    $filename = time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
                    $gPath = $file->storeAs('tours', $filename, 'public');
                    TourImage::create([
                        'tour_id' => $tour->id,
                        'image_path' => '/storage/' . $gPath,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tour updated successfully',
                'data' => $tour->load(['destination', 'category', 'images'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating tour: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete tour
     */
    public function destroy($id)
    {
        try {
            $tour = Tour::findOrFail($id);

            // Delete image if exists
            if ($tour->image) {
                $imagePath = str_replace('/storage/', '', $tour->image);
                Storage::disk('public')->delete($imagePath);
            }

            // Delete tour images
            foreach ($tour->images as $img) {
                if ($img->image_path) {
                    $imagePath = str_replace('/storage/', '', $img->image_path);
                    Storage::disk('public')->delete($imagePath);
                }
                $img->delete();
            }

            $tour->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tour deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting tour: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload additional tour images
     */
    public function uploadImage(Request $request, $id)
    {
        $tour = Tour::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $uploadedImages = [];

            foreach ($request->file('images') as $file) {
                $filename = time() . '_' . Str::random(6) . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('tours', $filename, 'public');

                $tourImage = TourImage::create([
                    'tour_id' => $tour->id,
                    'image_path' => '/storage/' . $imagePath,
                ]);

                $uploadedImages[] = $tourImage;
            }

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully',
                'data' => $uploadedImages
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading images: ' . $e->getMessage()
            ], 500);
        }
    }
}
