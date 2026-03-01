<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\AuditLogger;

class OrderObserver
{
    public function created(Order $order): void
    {
        AuditLogger::log('order.created', $order, [
            'order_number' => $order->order_number,
            'total' => (float) $order->total,
            'payment_method' => $order->payment_method,
        ]);
    }

    public function updated(Order $order): void
    {
        if ($order->isDirty('status') && $order->status === 'cancelled') {
            AuditLogger::log('order.cancelled', $order, [
                'order_number' => $order->order_number,
                'total' => (float) $order->total,
            ], $order->cancelled_by);
        }
    }
}
