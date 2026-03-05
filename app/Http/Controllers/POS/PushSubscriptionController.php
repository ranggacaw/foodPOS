<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class PushSubscriptionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:2048'],
            'public_key' => ['required', 'string', 'max:255'],
            'auth_token' => ['required', 'string', 'max:255'],
        ]);

        $subscription = PushSubscription::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'endpoint' => $validated['endpoint'],
            ],
            [
                'public_key' => $validated['public_key'],
                'auth_token' => $validated['auth_token'],
            ]
        );

        return Response::json(['success' => true, 'subscription_id' => $subscription->id]);
    }

    public function destroy(Request $request, $endpoint)
    {
        $subscription = PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $endpoint)
            ->first();

        if ($subscription) {
            $subscription->delete();
        }

        return Response::json(['success' => true]);
    }
}
