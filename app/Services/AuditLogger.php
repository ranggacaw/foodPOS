<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class AuditLogger
{
    public static function log(string $action, ?Model $model = null, array $payload = [], ?int $userId = null): void
    {
        try {
            ActivityLog::create([
                'user_id' => $userId ?? auth()->id(),
                'action' => $action,
                'model_type' => $model ? get_class($model) : 'Unknown',
                'model_id' => $model ? $model->getKey() : 0,
                'payload' => empty($payload) ? null : $payload,
                'ip_address' => request()->ip(),
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to write to audit log: {$e->getMessage()}", [
                'action' => $action,
                'model_type' => $model ? get_class($model) : 'Unknown',
                'model_id' => $model ? $model->getKey() : 0,
                'exception' => $e
            ]);
        }
    }
}
