<?php

namespace App\Observers;

use App\Models\MenuItem;
use App\Services\AuditLogger;

class MenuItemObserver
{
    public function created(MenuItem $menuItem): void
    {
        AuditLogger::log('menu_item.created', $menuItem, $menuItem->toArray());
    }

    public function updated(MenuItem $menuItem): void
    {
        AuditLogger::log('menu_item.updated', $menuItem, $menuItem->getChanges());
    }

    public function deleted(MenuItem $menuItem): void
    {
        AuditLogger::log('menu_item.deleted', $menuItem, $menuItem->toArray());
    }
}
