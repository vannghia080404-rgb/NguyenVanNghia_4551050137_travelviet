<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TourController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\Admin\DestinationController as AdminDestinationController;
use App\Http\Controllers\Api\Admin\TeamMemberController;
use App\Http\Controllers\Api\Admin\NotificationBroadcastController;
use App\Http\Controllers\Api\Admin\LoyaltyController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\SubscriberController;

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/subscribe', [SubscriberController::class, 'store']);
Route::post('/chatbot', [\App\Http\Controllers\Api\ChatbotController::class, 'chat']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::get('/debug-logs-secret-123', function() {
    $logPath = storage_path('logs/laravel.log');
    if (file_exists($logPath)) {
        return response(file_get_contents($logPath))->header('Content-Type', 'text/plain');
    }
    return 'No log file found';
});

Route::get('/tours', [TourController::class, 'index']);
Route::get('/tours/{slug}', [TourController::class, 'show']);

Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/categories', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
Route::get('/payment-methods', [\App\Http\Controllers\Api\PaymentMethodController::class, 'index']);
Route::get('/team-members', [TeamMemberController::class, 'index']);
Route::get('/settings/global', [\App\Http\Controllers\Api\SettingController::class, 'getGlobalSettings']);
Route::get('/promotions', [\App\Http\Controllers\Api\PublicPromotionController::class, 'index']);

// Shop (Public)
Route::get('/shop/products', [\App\Http\Controllers\ShopController::class, 'index']);
Route::get('/shop/products/{slug}', [\App\Http\Controllers\ShopController::class, 'show']);

// Tour sub-resources (public)
Route::get('/tours/{tourId}/hotels', [HotelController::class, 'index']);
Route::get('/tours/{tourId}/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/avatar', [AuthController::class, 'uploadAvatar']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Shop Cart & Checkout (User)
    Route::get('/shop/cart', [\App\Http\Controllers\ShopController::class, 'getCart']);
    Route::post('/shop/cart', [\App\Http\Controllers\ShopController::class, 'addToCart']);
    Route::put('/shop/cart/{id}', [\App\Http\Controllers\ShopController::class, 'updateCartItem']);
    Route::delete('/shop/cart/{id}', [\App\Http\Controllers\ShopController::class, 'removeFromCart']);
    Route::post('/shop/checkout', [\App\Http\Controllers\ShopController::class, 'checkout']);
    Route::post('/shop/check-voucher', [\App\Http\Controllers\ShopController::class, 'checkVoucher']);
    Route::get('/shop/orders', [\App\Http\Controllers\ShopController::class, 'getOrders']);
    Route::post('/shop/orders/{id}/receipt', [\App\Http\Controllers\ShopController::class, 'uploadReceipt']);
    Route::post('/shop/orders/{id}/pay', [\App\Http\Controllers\ShopController::class, 'generatePaymentUrl']);
    Route::delete('/shop/orders/{id}/cancel', [\App\Http\Controllers\ShopController::class, 'cancelOrder']);
    Route::post('/shop/orders/{id}/confirm-received', [\App\Http\Controllers\ShopController::class, 'confirmReceived']);

    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::post('/wishlist/toggle/{tourId}', [WishlistController::class, 'toggle']);
    Route::delete('/wishlist/clear-all', [WishlistController::class, 'clearAll']);
    Route::delete('/wishlist/{tourId}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{tourId}', [WishlistController::class, 'check']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'myBookings']);
    Route::post('/bookings/{booking_code}/receipt', [BookingController::class, 'uploadReceipt']);
    Route::post('/bookings/{booking_code}/pay', [BookingController::class, 'generatePaymentUrl']);
    Route::delete('/bookings/{booking_code}/cancel', [BookingController::class, 'cancelBooking']);

    // Reviews (submit - requires auth)
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Settings (Update)
    Route::post('/settings', [\App\Http\Controllers\Api\SettingController::class, 'updateSettings'])->middleware(\App\Http\Middleware\AdminMiddleware::class);

    // Admin Routes
    Route::middleware([\App\Http\Middleware\AdminMiddleware::class])->prefix('admin')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
        
        // Tour Management
        Route::get('/tours', [\App\Http\Controllers\Api\Admin\TourController::class, 'index']);
        Route::post('/tours', [\App\Http\Controllers\Api\Admin\TourController::class, 'store']);
        Route::get('/tours/{id}', [\App\Http\Controllers\Api\Admin\TourController::class, 'show']);
        Route::put('/tours/{id}', [\App\Http\Controllers\Api\Admin\TourController::class, 'update']);
        Route::delete('/tours/{id}', [\App\Http\Controllers\Api\Admin\TourController::class, 'destroy']);
        Route::post('/tours/{id}/upload-image', [\App\Http\Controllers\Api\Admin\TourController::class, 'uploadImage']);
        
        // Hotel Management
        Route::get('/hotels', [HotelController::class, 'all']);
        Route::post('/hotels', [HotelController::class, 'store']);
        Route::put('/hotels/{id}', [HotelController::class, 'update']);
        Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);
        
        // Booking Management
        Route::get('/bookings', [\App\Http\Controllers\Api\Admin\BookingController::class, 'index']);
        Route::get('/bookings/{id}', [\App\Http\Controllers\Api\Admin\BookingController::class, 'show']);
        Route::put('/bookings/{id}/status', [\App\Http\Controllers\Api\Admin\BookingController::class, 'updateStatus']);
        Route::put('/bookings/{id}/payment-status', [\App\Http\Controllers\Api\Admin\BookingController::class, 'updatePaymentStatus']);
        Route::put('/bookings/{id}/notes', [\App\Http\Controllers\Api\Admin\BookingController::class, 'updateNotes']);
        Route::delete('/bookings/{id}', [\App\Http\Controllers\Api\Admin\BookingController::class, 'destroy']);
        
        // Review Management
        Route::get('/reviews', [ReviewController::class, 'adminIndex']);
        Route::post('/reviews/{id}/approve', [ReviewController::class, 'approve']);
        Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);
        Route::put('/reviews/{id}', [ReviewController::class, 'updateReview']);
        
        // User Management
        Route::get('/users', [\App\Http\Controllers\Api\Admin\UserController::class, 'index']);
        Route::get('/users/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'show']);
        Route::put('/users/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'update']);
        Route::put('/users/{id}/role', [\App\Http\Controllers\Api\Admin\UserController::class, 'updateRole']);
        Route::delete('/users/{id}', [\App\Http\Controllers\Api\Admin\UserController::class, 'destroy']);
        
        // Destination Management (Admin)
        Route::get('/destinations', [AdminDestinationController::class, 'index']);
        Route::post('/destinations', [AdminDestinationController::class, 'store']);
        Route::get('/destinations/{id}', [AdminDestinationController::class, 'show']);
        Route::put('/destinations/{id}', [AdminDestinationController::class, 'update']);
        Route::delete('/destinations/{id}', [AdminDestinationController::class, 'destroy']);
        
        // Payment Methods Management
        Route::get('/payment-methods', [\App\Http\Controllers\Api\Admin\PaymentMethodController::class, 'index']);
        Route::post('/payment-methods', [\App\Http\Controllers\Api\Admin\PaymentMethodController::class, 'store']);
        Route::put('/payment-methods/{id}', [\App\Http\Controllers\Api\Admin\PaymentMethodController::class, 'update']);
        Route::delete('/payment-methods/{id}', [\App\Http\Controllers\Api\Admin\PaymentMethodController::class, 'destroy']);

        // Vouchers Management
        Route::get('/vouchers', [\App\Http\Controllers\Api\Admin\AdminVoucherController::class, 'index']);
        Route::post('/vouchers', [\App\Http\Controllers\Api\Admin\AdminVoucherController::class, 'store']);
        Route::put('/vouchers/{id}', [\App\Http\Controllers\Api\Admin\AdminVoucherController::class, 'update']);
        Route::delete('/vouchers/{id}', [\App\Http\Controllers\Api\Admin\AdminVoucherController::class, 'destroy']);

        // Category Management (Admin)
        Route::get('/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'index']);
        Route::post('/categories', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'store']);
        Route::put('/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'destroy']);
        
        // Team Management
        Route::get('/team-members', [TeamMemberController::class, 'index']);
        Route::post('/team-members', [TeamMemberController::class, 'store']);
        Route::put('/team-members/{id}', [TeamMemberController::class, 'update']);
        Route::delete('/team-members/{id}', [TeamMemberController::class, 'destroy']);
        
        // System Settings & Broadcast
        Route::get('/broadcast-notifications', [NotificationBroadcastController::class, 'index']);
        Route::post('/broadcast-notifications', [NotificationBroadcastController::class, 'send']);

        // Loyalty & Promotions
        Route::get('/ranks', [LoyaltyController::class, 'getRanks']);
        Route::post('/ranks', [LoyaltyController::class, 'storeRank']);
        Route::put('/ranks/{id}', [LoyaltyController::class, 'updateRank']);
        Route::delete('/ranks/{id}', [LoyaltyController::class, 'destroyRank']);

        Route::get('/promotions', [LoyaltyController::class, 'getPromotions']);
        Route::post('/promotions', [LoyaltyController::class, 'storePromotion']);
        Route::put('/promotions/{id}', [LoyaltyController::class, 'updatePromotion']);
        Route::delete('/promotions/{id}', [LoyaltyController::class, 'destroyPromotion']);

        // Shop Management (Admin)
        Route::get('/shop/products', [\App\Http\Controllers\AdminShopController::class, 'index']);
        Route::post('/shop/products', [\App\Http\Controllers\AdminShopController::class, 'store']);
        Route::put('/shop/products/{id}', [\App\Http\Controllers\AdminShopController::class, 'update']);
        Route::delete('/shop/products/{id}', [\App\Http\Controllers\AdminShopController::class, 'destroy']);
        
        Route::get('/shop/orders', [\App\Http\Controllers\AdminShopController::class, 'getOrders']);
        Route::put('/shop/orders/{id}/status', [\App\Http\Controllers\AdminShopController::class, 'updateOrderStatus']);
        Route::put('/shop/orders/{id}/payment-status', [\App\Http\Controllers\AdminShopController::class, 'updatePaymentStatus']);
        Route::post('/shop/orders/{id}/trackings', [\App\Http\Controllers\AdminShopController::class, 'addTracking']);
    });
});
