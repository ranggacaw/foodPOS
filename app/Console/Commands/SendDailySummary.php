<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\User;
use App\Notifications\DailySalesSummary;
use Illuminate\Console\Command;

class SendDailySummary extends Command
{
    protected $signature = 'app:send-daily-summary';

    protected $description = 'Send daily sales summary notifications to admins';

    public function handle()
    {
        $yesterday = now()->subDay()->toDateString();

        $orders = Order::where('status', 'completed')
            ->whereDate('created_at', $yesterday)
            ->get();

        $orderCount = $orders->count();
        $totalRevenue = $orders->sum('total');

        if ($orderCount > 0) {
            $admins = User::where('role', 'admin')->get();

            foreach ($admins as $admin) {
                $admin->notify(new DailySalesSummary(
                    $yesterday,
                    $orderCount,
                    (float) $totalRevenue
                ));
            }

            $this->info("Daily summary sent to {$admins->count()} admin(s) for {$yesterday}");
        } else {
            $this->info("No orders found for {$yesterday}");
        }

        return Command::SUCCESS;
    }
}
