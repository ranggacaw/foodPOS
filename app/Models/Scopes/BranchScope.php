<?php

namespace App\Models\Scopes;

use App\Services\BranchContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class BranchScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $activeBranchId = BranchContext::getActiveBranchId();

        if ($activeBranchId !== null) {
            $builder->where('branch_id', $activeBranchId);
        }
    }
}
