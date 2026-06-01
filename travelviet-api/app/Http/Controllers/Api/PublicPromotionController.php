<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;

class PublicPromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::with('requiredRank')
            ->where('status', 'active');
            
        // Filter by date
        $now = now();
        $query->where(function ($q) use ($now) {
            $q->whereNull('start_date')
              ->orWhere('start_date', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', $now);
        });

        // Get featured promotions
        if ($request->has('featured')) {
            $query->where('is_featured', 1);
        }

        $promotions = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $promotions
        ]);
    }
}
