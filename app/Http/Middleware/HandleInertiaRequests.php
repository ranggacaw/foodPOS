<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $branches = null;
        $activeBranchId = null;

        if ($user && $user->role === 'admin' && $user->branch_id === null) {
            try {
                $branches = \App\Models\Branch::where('is_active', true)->get();
                $activeBranchId = \App\Services\BranchContext::getActiveBranchId();
            } catch (\Exception $e) {
                $branches = [];
            }
        }

        $data = [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];

        if ($branches !== null) {
            $data['branches'] = $branches;
        }
        if ($activeBranchId !== null) {
            $data['active_branch_id'] = $activeBranchId;
        }

        return $data;
    }
}
