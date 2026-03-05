<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\BranchContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('user:id,name')->latest('created_at');

        $user = $request->user();

        if ($user->branch_id) {
            $query->where('branch_id', $user->branch_id);
        } else {
            $activeBranchId = BranchContext::getActiveBranchId();
            if ($activeBranchId) {
                $query->where('branch_id', $activeBranchId);
            }
        }

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', Carbon::parse($request->query('from'))->startOfDay());
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', Carbon::parse($request->query('to'))->endOfDay());
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/AuditLog/Index', [
            'logs' => $logs,
            'filters' => [
                'action' => $request->query('action', ''),
                'from' => $request->query('from', ''),
                'to' => $request->query('to', ''),
            ]
        ]);
    }
}
