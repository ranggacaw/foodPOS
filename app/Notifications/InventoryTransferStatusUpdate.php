<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\InventoryTransfer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class InventoryTransferStatusUpdate extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public InventoryTransfer $transfer,
        public string $status
    ) {}

    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable): array
    {
        $statusText = ucfirst($this->status);
        $emoji = $this->status === 'approved' ? '✅' : ($this->status === 'rejected' ? '❌' : '📦');

        return [
            'title' => "{$emoji} Inventory Transfer {$statusText}",
            'body' => "Transfer of {$this->transfer->ingredient->name} ({$this->transfer->quantity} {$this->transfer->ingredient->unit}) from {$this->transfer->from_branch->name} to {$this->transfer->to_branch->name} has been {$this->status}.",
            'url' => route('admin.inventory-transfers.index'),
        ];
    }
}
