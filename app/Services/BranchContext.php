<?php

namespace App\Services;

use Illuminate\Support\Facades\Session;

class BranchContext
{
    public static function setActiveBranchId(?int $id): void
    {
        if ($id === null) {
            Session::forget('active_branch_id');
        } else {
            Session::put('active_branch_id', $id);
        }
    }

    public static function getActiveBranchId(): ?int
    {
        return Session::get('active_branch_id');
    }
}
