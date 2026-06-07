<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\VerifyRegistrationMail;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    private function generateOtp()
    {
        return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực',
                'errors' => $validator->errors()
            ], 422);
        }

        $otp = $this->generateOtp();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(15),
            'email_verified_at' => null
        ]);

        // Gửi email OTP ngay lập tức (bỏ qua hàng đợi)
        try {
            Mail::to($user->email)->send(new VerifyRegistrationMail($otp));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Lỗi gửi mail đăng ký: ' . $e->getMessage());
            // Xóa user vừa tạo vì không gửi được OTP
            $user->delete();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: Không thể gửi email xác thực. Chi tiết lỗi: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã xác thực.',
            'email' => $user->email
        ], 201);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['success' => false, 'message' => 'Tài khoản đã được xác thực.'], 400);
        }

        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['success' => false, 'message' => 'Mã xác thực không hợp lệ hoặc đã hết hạn.'], 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'otp' => null,
            'otp_expires_at' => null
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Xác thực thành công',
            'data' => $user,
            'token' => $token
        ]);
    }

    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['success' => false, 'message' => 'Tài khoản đã được xác thực.'], 400);
        }

        $otp = $this->generateOtp();
        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(15)
        ]);

        try {
            Mail::to($user->email)->send(new VerifyRegistrationMail($otp));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Lỗi gửi lại mail OTP: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: Không thể gửi email xác thực. Chi tiết lỗi: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mã xác nhận mới đã được gửi.'
        ]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email hoặc mật khẩu không chính xác'
            ], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'unverified' => true,
                'message' => 'Tài khoản chưa được xác thực. Vui lòng xác thực email.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'data' => $user,
            'token' => $token
        ]);
    }

    // Google Login
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                // Đăng ký mới qua Google thì không cần password và OTP
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make(Str::random(24)),
                    'role' => 'user',
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'email_verified_at' => now(), // Đã xác thực qua Google
                ]);
            } else {
                // Link google_id nếu chưa có
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->id, 'email_verified_at' => now()]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect về frontend kèm token
            return redirect(env('FRONTEND_URL', 'http://localhost:8080') . "/auth/callback?token={$token}");

        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:8080') . "/login?error=google_auth_failed");
        }
    }

    public function profile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'              => 'required|string|max:255',
            'phone'             => 'nullable|string|max:20',
            'address'           => 'nullable|string|max:255',
            'bank_name'         => 'nullable|string|max:255',
            'bank_account_no'   => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user->update([
            'name'              => $request->name,
            'phone'             => $request->phone,
            'address'           => $request->address,
            'bank_name'         => $request->bank_name,
            'bank_account_no'   => $request->bank_account_no,
            'bank_account_name' => $request->bank_account_name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công',
            'data'    => $user->fresh()
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate(['avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120']);
        
        $user = $request->user();
        
        // Delete old avatar if exists
        // Ignore local delete
        
        $file = $request->file('avatar');
        $imagePath = cloudinary()->uploadApi()->upload($file->getRealPath(), [
            'folder' => 'travelviet/avatars'
        ])['secure_url'];
        
        $user->update(['avatar' => $imagePath]);
        
        return response()->json([
            'success' => true,
            'message' => 'Cập nhật ảnh đại diện thành công',
            'data'    => $user->fresh()
        ]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xác thực',
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu hiện tại không đúng'
            ], 400);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đăng xuất thành công'
        ]);
    }

    /**
     * Send password reset OTP to email.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản với email này.'
            ], 404);
        }

        $otp = $this->generateOtp();
        $user->update([
            'otp'            => $otp,
            'otp_expires_at' => now()->addMinutes(15),
        ]);

        try {
            Mail::to($user->email)->send(new \App\Mail\VerifyRegistrationMail($otp));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Lỗi gửi mail quên mật khẩu: ' . $e->getMessage());
        }

        return response()->json([
            'success'  => true,
            'message'  => 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.'
        ]);
    }

    /**
     * Reset password using OTP.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email',
            'otp'                   => 'required|string|size:6',
            'new_password'          => 'required|string|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy tài khoản.'], 404);
        }

        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['success' => false, 'message' => 'Mã OTP không hợp lệ hoặc đã hết hạn.'], 400);
        }

        $user->update([
            'password'       => \Illuminate\Support\Facades\Hash::make($request->new_password),
            'otp'            => null,
            'otp_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.',
        ]);
    }
}
