<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('featured')) {
            // Use Eloquent aggregates to safely count/avg related data
            $destinations = Destination::withCount([
                    'tours as total_bookings' => function ($query) {
                        $query->join('bookings', 'bookings.tour_id', '=', 'tours.id');
                    },
                    'tours as total_wishlists' => function ($query) {
                        $query->join('wishlists', 'wishlists.tour_id', '=', 'tours.id');
                    },
                    'tours as total_reviews' => function ($query) {
                        $query->join('reviews', 'reviews.tour_id', '=', 'tours.id')
                              ->where('reviews.is_approved', true);
                    },
                    'tours as featured_tours_count' => function ($query) {
                        $query->where('featured', true);
                    },
                ])
                ->withAvg('tours as avg_rating', 'rating')
                ->orderByDesc('featured_tours_count')
                ->orderByDesc('avg_rating')
                ->orderByDesc('total_wishlists')
                ->orderByDesc('total_reviews')
                ->orderByDesc('total_bookings')
                ->get();
        } else {
            $destinations = Destination::all();
        }

        return response()->json([
            'success' => true,
            'data' => $destinations
        ]);
    }
}
