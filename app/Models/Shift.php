<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    protected $fillable = [
        'branch_id',
        'user_id',
        'opening_cash',
        'closing_cash',
        'notes',
        'status',
        'opened_at',
        'closed_at',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new \App\Models\Scopes\BranchScope);
    }

    protected function casts(): array
    {
        return [
            'opening_cash' => 'decimal:2',
            'closing_cash' => 'decimal:2',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function expectedClosingCash(): float
    {
        $cashOrdersTotal = $this->orders()
            ->where('status', 'completed')
            ->where('payment_method', 'cash')
            ->sum('total');

        return (float) $this->opening_cash + (float) $cashOrdersTotal;
    }
}
