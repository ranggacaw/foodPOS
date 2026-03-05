<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:send-daily-summary')
    ->dailyAt('23:59')
    ->timezone('Asia/Jakarta')
    ->description('Send daily sales summary at 23:59 Asia/Jakarta');
