import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

interface ExtendedServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
    __WB_MANIFEST: any;
    skipWaiting(): void;
    addEventListener(type: string, listener: (event: any) => void): void;
    clients: any;
    registration: ServiceWorkerRegistration;
}

declare const self: ExtendedServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

let allowlist;

if (import.meta.env.DEV) {
    allowlist = [/^\/$/];
}

cleanupOutdatedCaches();

self.addEventListener('install', (event: any) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
    event.waitUntil(self.clients.claim());
});

const handler = createHandlerBoundToURL('/offline.html');
const navigationRoute = new NavigationRoute(handler, {
    allowlist: [/^\/pos/, /^\/admin/, /^\/dashboard/, /^\/profile/],
});

registerRoute(navigationRoute);

registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
        ],
    })
);

registerRoute(
    ({ request }) => request.destination === 'script' || request.destination === 'style',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    })
);

self.addEventListener('sync', (event: any) => {
    if (event.tag === 'pos-order-queue') {
        event.waitUntil(
            (async () => {
                try {
                    const db = await (self as any).indexedDB.open('foodpos-queue', 1);
                    const tx = db.transaction('pending-orders', 'readonly');
                    const store = tx.objectStore('pending-orders');
                    const index = store.index('by-status');
                    const pendingOrders = await index.getAll('pending');

                    for (const order of pendingOrders) {
                        try {
                            const response = await fetch('/pos/orders', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                },
                                body: JSON.stringify(order.payload),
                                credentials: 'include',
                            });

                            if (response.ok) {
                                const updateTx = db.transaction('pending-orders', 'readwrite');
                                const updateStore = updateTx.objectStore('pending-orders');
                                await updateStore.put({
                                    ...order,
                                    status: 'synced',
                                    synced_at: new Date().toISOString(),
                                });
                            }
                        } catch (error) {
                            console.error('Failed to sync order:', order.id, error);
                        }
                    }
                } catch (error) {
                    console.error('Sync failed:', error);
                }
            })()
        );
    }
});

self.addEventListener('push', (event: any) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/',
            },
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'FoodPOS Notification', options)
        );
    }
});

self.addEventListener('notificationclick', (event: any) => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList: any[]) => {
            const url = event.notification.data.url || '/';

            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }

            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
