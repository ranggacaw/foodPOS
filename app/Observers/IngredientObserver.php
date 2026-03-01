<?php

namespace App\Observers;

use App\Models\Ingredient;
use App\Services\AuditLogger;

class IngredientObserver
{
    public function created(Ingredient $ingredient): void
    {
        AuditLogger::log('ingredient.created', $ingredient, $ingredient->toArray());
    }

    public function updated(Ingredient $ingredient): void
    {
        AuditLogger::log('ingredient.updated', $ingredient, $ingredient->getChanges());
    }

    public function deleted(Ingredient $ingredient): void
    {
        AuditLogger::log('ingredient.deleted', $ingredient, $ingredient->toArray());
    }
}
