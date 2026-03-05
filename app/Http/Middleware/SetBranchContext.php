<?php

namespace App\Http\Middleware;

use App\Services\BranchContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetBranchContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            if ($user->role === 'admin' && $user->branch_id === null) {
                $activeBranchId = BranchContext::getActiveBranchId();
            } else {
                BranchContext::setActiveBranchId($user->branch_id);
            }
        }

        return $next($request);
    }
}
