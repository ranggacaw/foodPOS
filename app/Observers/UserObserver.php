<?php

namespace App\Observers;

use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Support\Arr;

class UserObserver
{
    private function sanitize(array $data): array
    {
        return Arr::except($data, ['password', 'remember_token']);
    }

    public function created(User $user): void
    {
        AuditLogger::log('user.created', $user, $this->sanitize($user->toArray()));
    }

    public function updated(User $user): void
    {
        AuditLogger::log('user.updated', $user, $this->sanitize($user->getChanges()));
    }

    public function deleted(User $user): void
    {
        AuditLogger::log('user.deleted', $user, $this->sanitize($user->toArray()));
    }
}
