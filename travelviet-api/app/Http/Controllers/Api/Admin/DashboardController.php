<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\User;
use App\Models\Review;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers      = User::where('role', 'user')->count();
        $totalTours      = Tour::count();
        $totalBookings   = Booking::count();
        $pendingBookings = Booking::whereIn('status', ['pending', 'confirmed', 'processing'])->count();
        $totalRevenue    = Booking::where('payment_status', 'completed')->sum('total_price');

        // Recent bookings with user + tour relation (last 50 for reports)
        $recentBookings = Booking::with(['user:id,name,email', 'tour:id,name,slug'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        // Monthly bookings count (last 6 months)
        $monthlyBookings = Booking::selectRaw('COUNT(*) as count, DATE_FORMAT(created_at, "%Y-%m") as month')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Revenue breakdown by month (last 6 months)
        $monthlyRevenue = Booking::where('payment_status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, SUM(total_price) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users'      => $totalUsers,
                'total_tours'      => $totalTours,
                'total_bookings'   => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'total_revenue'    => $totalRevenue,
                'monthly_revenue'  => $monthlyRevenue,
                'monthly_bookings' => $monthlyBookings,
                'recent_bookings'  => $recentBookings,
            ],
        ]);
    }
}
