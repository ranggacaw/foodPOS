<?php

namespace App\Observers;

use App\Models\Inventory;
use App\Services\AuditLogger;

class InventoryObserver
{
    public function updated(Inventory $inventory): void
    {
        if ($inventory->isDirty('quantity_on_hand')) {
            AuditLogger::log('inventory.updated', $inventory, [
                'ingredient_name' => $inventory->ingredient->name,
                'old_quantity' => (float) $inventory->getOriginal('quantity_on_hand'),
                'new_quantity' => (float) $inventory->quantity_on_hand,
            ]);
        }
    }
}
