<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'payload',
        'ip_address',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function save(array $options = [])
    {
        if ($this->exists) {
            throw new \RuntimeException('Activity logs are immutable and cannot be updated.');
        }

        return parent::save($options);
    }

    public function delete()
    {
        throw new \RuntimeException('Activity logs are immutable and cannot be deleted.');
    }
}
