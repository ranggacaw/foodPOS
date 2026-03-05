<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use App\Services\BranchContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ShiftController extends Controller
{
    public function index(Request $request): Response
    {
        $shifts = Shift::with('user')
            ->when(!$request->user()->isAdmin(), function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->latest('opened_at')
            ->paginate(15);

        return Inertia::render('POS/Shift/History', [
            'shifts' => $shifts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('POS/Shift/Open');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'opening_cash' => 'required|numeric|min:0',
        ]);

        $activeShift = $request->user()->shifts()->where('status', 'open')->first();

        if ($activeShift) {
            return back()->withErrors(['opening_cash' => 'You already have an open shift.']);
        }

        $branch_id = $request->user()->branch_id ?? BranchContext::getActiveBranchId();

        $request->user()->shifts()->create([
            'branch_id' => $branch_id,
            'opening_cash' => $request->opening_cash,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        return redirect()->route('pos.index')->with('success', 'Shift opened successfully.');
    }

    public function show(Shift $shift): Response
    {
        if (auth()->user()->id !== $shift->user_id && !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized access to this shift.');
        }

        $shift->load([
            'user',
            'orders' => function ($query) {
                $query->with('items.menuItem');
            }
        ]);

        $orders = $shift->orders;
        $totalOrders = $orders->count();
        $totalRevenue = $orders->where('status', 'completed')->sum('total');

        $paymentBreakdown = [
            'cash' => $orders->where('status', 'completed')->where('payment_method', 'cash')->sum('total'),
            'card' => $orders->where('status', 'completed')->where('payment_method', 'card')->sum('total'),
            'qris' => $orders->where('status', 'completed')->where('payment_method', 'qris')->sum('total'),
        ];

        return Inertia::render('POS/Shift/Detail', [
            'shift' => $shift,
            'stats' => [
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'payment_breakdown' => $paymentBreakdown,
                'expected_cash' => $shift->expectedClosingCash(),
            ]
        ]);
    }

    public function close(Shift $shift): Response
    {
        if (auth()->user()->id !== $shift->user_id && !auth()->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('POS/Shift/Close', [
            'shift' => $shift,
            'expected_cash' => $shift->expectedClosingCash(),
        ]);
    }

    public function update(Request $request, Shift $shift): RedirectResponse
    {
        if ($request->user()->id !== $shift->user_id && !$request->user()->isAdmin()) {
            abort(403);
        }

        if (!$shift->isOpen()) {
            return back()->with('error', 'Shift is already closed.');
        }

        $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $shift->update([
            'closing_cash' => $request->closing_cash,
            'notes' => $request->notes,
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return redirect()->route('pos.shifts.show', $shift)->with('success', 'Shift closed successfully.');
    }
}
