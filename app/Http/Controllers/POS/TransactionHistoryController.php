<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionHistoryController extends Controller
{
    /**
     * Display a paginated list of summarized daily transactions.
     */
    public function index(Request $request)
    {
        $isSqlite = DB::connection()->getDriverName() === 'sqlite';

        // Group by Asia/Jakarta (+07:00) date
        $dateExpression = $isSqlite
            ? "date(datetime(created_at, '+7 hours'))"
            : "DATE(DATE_ADD(created_at, INTERVAL 7 HOUR))";

        $from = $request->input('from');
        $to = $request->input('to');

        $query = Order::query()
            ->select(
                DB::raw("$dateExpression as date"),
                DB::raw("COUNT(id) as order_count"),
                DB::raw("SUM(total) as total_revenue")
            )
            ->where('status', 'completed');

        if ($from) {
            $fromStart = Carbon::parse($from, 'Asia/Jakarta')->startOfDay()->setTimezone('UTC');
            $query->where('created_at', '>=', $fromStart);
        }

        if ($to) {
            $toEnd = Carbon::parse($to, 'Asia/Jakarta')->endOfDay()->setTimezone('UTC');
            $query->where('created_at', '<=', $toEnd);
        }

        $query->groupBy(DB::raw($dateExpression))
            ->orderBy('date', 'desc');

        $summaries = $query->paginate(15)->withQueryString();

        $summaries->getCollection()->transform(function ($item) {
            $item->total_revenue = (float) $item->total_revenue;
            $item->order_count = (int) $item->order_count;
            return $item;
        });

        return Inertia::render('POS/TransactionHistory', [
            'summaries' => $summaries,
            'filters' => [
                'from' => $from ?? '',
                'to' => $to ?? '',
            ]
        ]);
    }

    /**
     * Display orders for a specific date in Asia/Jakarta timezone.
     */
    public function show(string $date)
    {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            abort(404);
        }

        // Default query uses app timezone UTC, but we want the logical boundaries of the Asia/Jakarta date
        $startOfDay = Carbon::createFromFormat('Y-m-d', $date, 'Asia/Jakarta')->startOfDay()->setTimezone('UTC');
        $endOfDay = Carbon::createFromFormat('Y-m-d', $date, 'Asia/Jakarta')->endOfDay()->setTimezone('UTC');

        $orders = Order::with(['items.menuItem'])
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('POS/TransactionHistoryDay', [
            'date' => $date,
            'orders' => $orders
        ]);
    }
}
