<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    protected $table = 'inventory';

    protected $fillable = [
        'ingredient_id',
        'quantity_on_hand',
        'restock_threshold',
    ];

    protected function casts(): array
    {
        return [
            'quantity_on_hand' => 'decimal:4',
            'restock_threshold' => 'decimal:4',
        ];
    }

    /**
     * @return BelongsTo<Ingredient, $this>
     */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    /**
     * Check if this inventory item is below the restock threshold.
     */
    public function isLowStock(): bool
    {
        return (float) $this->quantity_on_hand <= (float) $this->restock_threshold;
    }
}
