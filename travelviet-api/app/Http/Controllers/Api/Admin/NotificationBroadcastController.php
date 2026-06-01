<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Notifications\AdminBroadcastNotification;

class NotificationBroadcastController extends Controller
{
    /**
     * List all sent broadcasts (from notifications table)
     */
    public function index()
    {
        // Get distinct notifications sent by admin
        $broadcasts = \DB::table('notifications')
            ->select('id', 'data', 'created_at')
            ->where('type', AdminBroadcastNotification::class)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->unique(function ($n) {
                return $n->data . date('Y-m-d H:i', strtotime($n->created_at));
            })
            ->take(50)
            ->values()
            ->map(function ($n) {
                $data = json_decode($n->data, true);
                return [
                    'id' => $n->id,
                    'title' => $data['title'] ?? '',
                    'message' => $data['message'] ?? '',
                    'type' => $data['broadcast_type'] ?? 'system',
                    'sent_at' => $n->created_at,
                ];
            });

        return response()->json(['success' => true, 'data' => $broadcasts]);
    }

    /**
     * Send broadcast notification
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'message'        => 'required|string',
            'broadcast_type' => 'required|in:all,individual,role',
            'target_user_id' => 'nullable|integer|exists:users,id',
            'target_role'    => 'nullable|in:user,admin,staff',
        ]);

        $query = User::query();

        if ($validated['broadcast_type'] === 'individual' && isset($validated['target_user_id'])) {
            $query->where('id', $validated['target_user_id']);
        } elseif ($validated['broadcast_type'] === 'role' && isset($validated['target_role'])) {
            $query->where('role', $validated['target_role']);
        }

        $users = $query->get();
        $count = $users->count();

        foreach ($users as $user) {
            $user->notify(new AdminBroadcastNotification(
                $validated['title'],
                $validated['message'],
                $validated['broadcast_type']
            ));
        }

        return response()->json([
            'success' => true,
            'message' => "Đã gửi thông báo thành công đến {$count} người dùng.",
            'recipients' => $count,
        ]);
    }
}
