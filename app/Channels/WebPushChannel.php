<?php

namespace App\Channels;

use App\Models\PushSubscription;
use Illuminate\Notifications\Notification;

class WebPushChannel
{
    public function send($notifiable, Notification $notification)
    {
        $subscriptions = PushSubscription::where('user_id', $notifiable->id)->get();

        foreach ($subscriptions as $subscription) {
            $payload = $notification->toWebPush($notifiable);

            $this->sendPushNotification($subscription, $payload);
        }
    }

    protected function sendPushNotification(PushSubscription $subscription, array $payload)
    {
        $vapidKeys = [
            'publicKey' => env('VAPID_PUBLIC_KEY'),
            'privateKey' => env('VAPID_PRIVATE_KEY'),
        ];

        if (!$vapidKeys['publicKey'] || !$vapidKeys['privateKey']) {
            return;
        }

        $data = json_encode([
            'title' => $payload['title'],
            'body' => $payload['body'],
            'url' => $payload['url'] ?? '/',
        ]);

        $headers = [
            'Content-Type: application/json',
            'TTL: 2419200',
            'Authorization: vapid ' . $this->createVapidHeader($subscription->endpoint, $vapidKeys),
        ];

        $ch = curl_init($subscription->endpoint);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_exec($ch);
        curl_close($ch);
    }

    protected function createVapidHeader($endpoint, $vapidKeys)
    {
        $parsedUrl = parse_url($endpoint);
        $audience = 'https://' . $parsedUrl['host'];

        $token = $this->jwtEncode($audience, $vapidKeys['publicKey'], $vapidKeys['privateKey']);

        return $vapidKeys['publicKey'] . '.' . $token;
    }

    protected function jwtEncode($audience, $publicKey, $privateKey)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'ES256']);
        $payload = json_encode([
            'aud' => $audience,
            'exp' => time() + (12 * 60 * 60),
            'sub' => 'mailto:' . env('VAPID_SUBJECT', 'admin@foodpos.com'),
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        $signature = '';
        openssl_sign(
            $base64UrlHeader . '.' . $base64UrlPayload,
            $signature,
            $privateKey,
            OPENSSL_ALGO_SHA256
        );

        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
    }

    protected function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
