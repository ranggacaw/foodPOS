<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : Carbon::today();

        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : Carbon::today()->endOfDay();

        $orders = Order::whereBetween('orders.created_at', [$from, $to])
            ->where('orders.status', '!=', 'cancelled');

        $totalRevenue = (clone $orders)->sum('total');
        $totalOrders = (clone $orders)->count();
        $totalCogs = (clone $orders)
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->sum('order_items.cost');
        $profit = $totalRevenue - $totalCogs;

        $topSellingItems = OrderItem::select(
            'menu_item_id',
            DB::raw('SUM(quantity) as total_quantity'),
            DB::raw('SUM(subtotal) as total_revenue'),
        )
            ->whereHas('order', function ($q) use ($from, $to) {
                $q->whereBetween('created_at', [$from, $to])
                    ->where('status', '!=', 'cancelled');
            })
            ->groupBy('menu_item_id')
            ->with('menuItem:id,name,price')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'summary' => [
                'total_revenue' => round((float) $totalRevenue, 2),
                'total_orders' => $totalOrders,
                'total_cogs' => round((float) $totalCogs, 2),
                'profit' => round((float) $profit, 2),
            ],
            'topSellingItems' => $topSellingItems,
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
        ]);
    }
}
