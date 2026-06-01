<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || (!auth()->user()->is_admin && !auth()->user()->is_staff)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Admin or Staff access required.'], 403);
        }
        return $next($request);
    }
}
