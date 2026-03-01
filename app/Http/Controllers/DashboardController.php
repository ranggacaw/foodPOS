<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Order;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $todayOrders = Order::whereDate('created_at', today())
            ->where('status', '!=', 'cancelled');

        $todayOrdersCount = (clone $todayOrders)->count();
        $todayRevenue = (clone $todayOrders)->sum('total');

        $lowStockCount = Inventory::whereColumn('quantity_on_hand', '<=', 'restock_threshold')->count();

        $activeShift = request()->user()->shifts()->where('status', 'open')->first();

        return Inertia::render('Dashboard', [
            'stats' => [
                'today_orders' => $todayOrdersCount,
                'today_revenue' => round((float) $todayRevenue, 2),
                'low_stock_count' => $lowStockCount,
            ],
            'active_shift' => $activeShift,
        ]);
    }
}
