<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenuItem extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'image',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<Recipe, $this>
     */
    public function recipes(): HasMany
    {
        return $this->hasMany(Recipe::class);
    }

    /**
     * @return BelongsToMany<Ingredient, $this>
     */
    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'recipes')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * Calculate the COGS (cost of goods sold) for this menu item
     * based on its recipe ingredients and their costs.
     */
    public function getCostAttribute(): float
    {
        return $this->recipes->sum(function (Recipe $recipe) {
            return $recipe->quantity * $recipe->ingredient->cost_per_unit;
        });
    }

    /**
     * Calculate the food cost percentage.
     */
    public function getFoodCostPercentageAttribute(): float
    {
        if ((float) $this->price === 0.0) {
            return 0;
        }

        return round(($this->cost / (float) $this->price) * 100, 2);
    }
}
