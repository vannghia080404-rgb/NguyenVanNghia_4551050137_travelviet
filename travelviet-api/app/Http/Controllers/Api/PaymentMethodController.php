<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PaymentMethod;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => PaymentMethod::where('is_active', true)->get()
        ]);
    }
}
