import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function PushNotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            setShowPrompt(true);
        }
    }, []);

    const requestPermission = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window.ServiceWorkerRegistration.prototype)) {
            alert('Push notifications are not supported in your browser.');
            setShowPrompt(false);
            return;
        }

        setLoading(true);

        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
                });

                await router.post(route('pos.push-subscriptions.store'), {
                    endpoint: subscription.endpoint,
                    public_key: Buffer.from(subscription.getKey('p256dh')!).toString('base64'),
                    auth_token: Buffer.from(subscription.getKey('auth')!).toString('base64'),
                });

                setShowPrompt(false);
            } else {
                setShowPrompt(false);
            }
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
            alert('Failed to enable notifications. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const dismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
            <div className="rounded-lg bg-white p-4 shadow-lg border border-gray-200">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                            Enable Notifications
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Stay updated with low stock alerts, transfer updates, and daily sales summaries.
                        </p>
                    </div>
                    <button
                        onClick={dismiss}
                        className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        title="Dismiss"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={dismiss}
                        disabled={loading}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={requestPermission}
                        disabled={loading}
                        className="flex-1 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enabling...' : 'Enable'}
                    </button>
                </div>
            </div>
        </div>
    );
}
