<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\Ingredient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Ingredient $ingredient,
        public float $currentQuantity,
        public float $threshold
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => '⚠️ Low Stock Alert',
            'body' => "{$this->ingredient->name} is running low. Current: {$this->currentQuantity} {$this->ingredient->unit}, Threshold: {$this->threshold} {$this->ingredient->unit}",
            'url' => route('admin.inventory.index'),
        ];
    }
}
