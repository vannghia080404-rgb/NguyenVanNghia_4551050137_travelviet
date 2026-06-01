<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use Illuminate\Http\Request;

class TourController extends Controller
{
    public function index(Request $request)
    {
        $query = Tour::with(['destination', 'category']);

        if ($request->has('destination')) {
            $query->whereHas('destination', function ($q) use ($request) {
                $q->where('slug', $request->destination);
            });
        }

        if ($request->has('region')) {
            $query->whereHas('destination', function ($q) use ($request) {
                $q->where('region', $request->region);
            });
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category)
                  ->orWhere('name', $request->category);
            });
        }

        if ($request->has('ids')) {
            $ids = explode(',', $request->ids);
            $query->whereIn('id', $ids);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('prices') && !empty($request->prices)) {
            $prices = explode(',', $request->prices);
            $query->where(function($q) use ($prices) {
                foreach($prices as $p) {
                    if ($p === '0-2') {
                        $q->orWhere('price', '<', 2000000);
                    } elseif ($p === '2-4') {
                        $q->orWhereBetween('price', [2000000, 4000000]);
                    } elseif ($p === '4-6') {
                        $q->orWhereBetween('price', [4000000, 6000000]);
                    } elseif ($p === '6-10') {
                        $q->orWhereBetween('price', [6000000, 10000000]);
                    } elseif ($p === '>10') {
                        $q->orWhere('price', '>', 10000000);
                    }
                }
            });
        }

        if ($request->has('durations') && !empty($request->durations)) {
            $durations = explode(',', $request->durations);
            $query->where(function($q) use ($durations) {
                foreach($durations as $d) {
                    if ($d === '1-3') {
                        $q->orWhereBetween('duration_days', [1, 3]);
                    } elseif ($d === '4-7') {
                        $q->orWhereBetween('duration_days', [4, 7]);
                    } elseif ($d === '>7') {
                        $q->orWhere('duration_days', '>', 7);
                    }
                }
            });
        }

        if ($request->has('featured')) {
            $query->where('featured', true)
                  ->withCount(['bookings', 'wishlists'])
                ->orderBy('featured', 'desc')
                ->orderBy('rating', 'desc')
                ->orderBy('wishlists_count', 'desc')
                ->orderBy('reviews_count', 'desc')
                ->orderBy('bookings_count', 'desc');
        }

        $perPage = $request->input('per_page', 6);
        $tours = $query->where('status', 'active')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $tours->items(),
            'meta' => [
                'current_page' => $tours->currentPage(),
                'last_page' => $tours->lastPage(),
                'total' => $tours->total(),
                'per_page' => $tours->perPage(),
            ]
        ]);
    }

    public function show($slug)
    {
        $tour = Tour::with(['destination', 'category', 'images', 'itineraries', 'reviews.user'])
            ->withCount(['bookings as completed_bookings_count' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->where('slug', $slug)
            ->first();

        if (!$tour) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tour'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tour
        ]);
    }
}
