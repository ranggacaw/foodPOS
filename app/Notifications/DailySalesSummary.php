<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DailySalesSummary extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $date,
        public int $orderCount,
        public float $totalRevenue
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => '📊 Daily Sales Summary',
            'body' => "Date: {$this->date} | Orders: {$this->orderCount} | Revenue: Rp " . number_format($this->totalRevenue, 0, ',', '.'),
            'url' => route('admin.reports.index'),
        ];
    }
}
