<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CustomerRank;
use App\Models\Promotion;
use Illuminate\Support\Facades\Storage;

class LoyaltyController extends Controller
{
    // --- RANKS ---
    public function getRanks()
    {
        return response()->json(CustomerRank::orderBy('min_spending', 'asc')->get());
    }

    public function storeRank(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_spending' => 'required|numeric|min:0',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'badge_icon' => 'nullable|string'
        ]);

        $rank = CustomerRank::create($validated);
        return response()->json(['success' => true, 'data' => $rank]);
    }

    public function updateRank(Request $request, $id)
    {
        $rank = CustomerRank::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_spending' => 'required|numeric|min:0',
            'discount_percent' => 'required|numeric|min:0|max:100',
            'badge_icon' => 'nullable|string'
        ]);

        $rank->update($validated);
        return response()->json(['success' => true, 'data' => $rank]);
    }

    public function destroyRank($id)
    {
        $rank = CustomerRank::findOrFail($id);
        $rank->delete();
        return response()->json(['success' => true]);
    }

    // --- PROMOTIONS ---
    public function getPromotions()
    {
        return response()->json(Promotion::with('requiredRank')->latest()->get());
    }

    public function storePromotion(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable',
            'discount_type' => 'required|in:percent,fixed_amount,gift',
            'discount_value' => 'required|numeric|min:0',
            'required_rank_id' => 'nullable|exists:customer_ranks,id',
            'is_featured' => 'boolean',
            'target_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:active,inactive',
            'badge' => 'nullable|string|max:50'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('promotions', 'public');
            $validated['image'] = Storage::url($path);
        }

        $promotion = Promotion::create($validated);
        return response()->json(['success' => true, 'data' => $promotion->load('requiredRank')]);
    }

    public function updatePromotion(Request $request, $id)
    {
        $promotion = Promotion::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable',
            'discount_type' => 'required|in:percent,fixed_amount,gift',
            'discount_value' => 'required|numeric|min:0',
            'required_rank_id' => 'nullable|exists:customer_ranks,id',
            'is_featured' => 'boolean',
            'target_url' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:active,inactive',
            'badge' => 'nullable|string|max:50'
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if it exists and is local
            if ($promotion->image && !str_starts_with($promotion->image, 'http')) {
                $oldPath = str_replace('/storage/', '', $promotion->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('promotions', 'public');
            $validated['image'] = Storage::url($path);
        } elseif ($request->has('image') && is_string($request->image)) {
            // Keep the old image or use the provided URL string
            $validated['image'] = $request->image;
        } else {
            // Keep the existing image if no new file is provided
            unset($validated['image']);
        }

        $promotion->update($validated);
        return response()->json(['success' => true, 'data' => $promotion->load('requiredRank')]);
    }

    public function destroyPromotion($id)
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->delete();
        return response()->json(['success' => true]);
    }
}
