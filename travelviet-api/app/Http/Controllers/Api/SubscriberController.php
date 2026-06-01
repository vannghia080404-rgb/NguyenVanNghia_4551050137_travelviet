<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255'
        ]);

        $subscriber = Subscriber::firstOrCreate(
            ['email' => $request->email],
            ['is_active' => true]
        );

        // If they were inactive, reactivate them
        if (!$subscriber->wasRecentlyCreated && !$subscriber->is_active) {
            $subscriber->update(['is_active' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký nhận bản tin thành công!'
        ]);
    }
}
