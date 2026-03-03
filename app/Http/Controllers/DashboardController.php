<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $startDateStr = request('start_date', today()->toDateString());
        $endDateStr = request('end_date', today()->toDateString());

        $startDate = \Illuminate\Support\Carbon::parse($startDateStr)->startOfDay();
        $endDate = \Illuminate\Support\Carbon::parse($endDateStr)->endOfDay();

        // Previous period for comparison
        $diffInDays = $startDate->diffInDays($endDate) + 1;
        $prevStartDate = (clone $startDate)->subDays($diffInDays);
        $prevEndDate = (clone $endDate)->subDays($diffInDays);

        // ──────────────────────────────────────────────────────────────
        // Current range base query
        // ──────────────────────────────────────────────────────────────
        $rangeOrders = Order::whereBetween('created_at', [$startDate, $endDate])->where('status', '!=', 'cancelled');
        $prevRangeOrders = Order::whereBetween('created_at', [$prevStartDate, $prevEndDate])->where('status', '!=', 'cancelled');

        // ──────────────────────────────────────────────────────────────
        // Summary values (current range)
        // ──────────────────────────────────────────────────────────────
        $rangeTotal = (float) (clone $rangeOrders)->sum('total');
        $rangeDiscount = (float) (clone $rangeOrders)->sum('discount');
        $rangeTax = (float) (clone $rangeOrders)->sum('tax');
        $rangeSubtotal = (float) (clone $rangeOrders)->sum('subtotal');
        $rangeCount = (clone $rangeOrders)->count();

        // Products sold in range
        $rangeItemsSold = (int) OrderItem::whereHas('order', function ($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate])->where('status', '!=', 'cancelled');
        })->sum('quantity');

        // Total cost (COGS) for range's orders
        $rangeCogs = (float) OrderItem::whereHas('order', function ($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate])->where('status', '!=', 'cancelled');
        })->sum('cost');
        $rangeProfit = $rangeTotal - $rangeCogs;

        // ──────────────────────────────────────────────────────────────
        // Previous range values for percentage change
        // ──────────────────────────────────────────────────────────────
        $prevTotal = (float) (clone $prevRangeOrders)->sum('total');
        $prevCount = (clone $prevRangeOrders)->count();
        $prevItemsSold = (int) OrderItem::whereHas('order', function ($q) use ($prevStartDate, $prevEndDate) {
            $q->whereBetween('created_at', [$prevStartDate, $prevEndDate])->where('status', '!=', 'cancelled');
        })->sum('quantity');
        $prevCogs = (float) OrderItem::whereHas('order', function ($q) use ($prevStartDate, $prevEndDate) {
            $q->whereBetween('created_at', [$prevStartDate, $prevEndDate])->where('status', '!=', 'cancelled');
        })->sum('cost');
        $prevProfit = $prevTotal - $prevCogs;

        $calcChange = fn($current, $previous): ?float => $previous > 0
            ? round((($current - $previous) / $previous) * 100, 2)
            : null;

        // ──────────────────────────────────────────────────────────────
        // Top products
        // ──────────────────────────────────────────────────────────────
        $topProducts = OrderItem::select('menu_item_id', DB::raw('SUM(quantity) as total_qty'))
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate])->where('status', '!=', 'cancelled');
            })
            ->with('menuItem:id,name')
            ->groupBy('menu_item_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'name' => $item->menuItem?->name ?? 'Unknown',
                'qty' => (int) $item->total_qty,
            ]);

        // ──────────────────────────────────────────────────────────────
        // Payment method breakdown
        // ──────────────────────────────────────────────────────────────
        $paymentBreakdown = (clone $rangeOrders)
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
            ->groupBy('payment_method')
            ->orderByDesc('count')
            ->get()
            ->map(fn($row) => [
                'method' => $row->payment_method,
                'count' => (int) $row->count,
                'revenue' => (float) $row->revenue,
            ]);

        // ──────────────────────────────────────────────────────────────
        // Low stock
        // ──────────────────────────────────────────────────────────────
        $lowStockCount = Inventory::whereColumn('quantity_on_hand', '<=', 'restock_threshold')->count();

        // ──────────────────────────────────────────────────────────────
        // Active shift
        // ──────────────────────────────────────────────────────────────
        $activeShift = request()->user()->shifts()->where('status', 'open')->first();

        return Inertia::render('Dashboard', [
            'stats' => [
                // Summary cards
                'total_penjualan' => $rangeTotal,
                'total_penjualan_change' => $calcChange($rangeTotal, $prevTotal),
                'total_keuntungan' => $rangeProfit,
                'total_keuntungan_change' => $calcChange($rangeProfit, $prevProfit),
                'total_transaksi' => $rangeCount,
                'total_transaksi_change' => $calcChange($rangeCount, $prevCount),
                'produk_terjual' => $rangeItemsSold,
                'produk_terjual_change' => $calcChange($rangeItemsSold, $prevItemsSold),

                // Detail penjualan
                'penjualan_kotor' => $rangeSubtotal,
                'diskon' => $rangeDiscount,
                'redeem_poin' => 0,
                'biaya_layanan' => 0,
                'pajak' => $rangeTax,
                'total_penjualan_detail' => $rangeTotal,

                // Kasbon
                'total_kasbon' => 0,
                'total_uang_muka' => 0,
                'total_pelanggan_kasbon' => 0,

                // Arus kas
                'total_kas_masuk' => $rangeTotal,
                'total_kas_keluar' => 0,

                // Low stock
                'low_stock_count' => $lowStockCount,

                // Today's orders (legacy)
                'today_orders' => $rangeCount,
                'today_revenue' => $rangeTotal,
            ],
            'top_products' => $topProducts,
            'payment_breakdown' => $paymentBreakdown,
            'active_shift' => $activeShift,
            'filters' => [
                'start_date' => $startDateStr,
                'end_date' => $endDateStr,
            ],
        ]);
    }
}
