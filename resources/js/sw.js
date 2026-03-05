// FoodPOS Service Worker — injectManifest strategy
// Workbox injects the precache manifest into self.__WB_MANIFEST at build time.

import { precacheAndRoute } from 'workbox-precaching';

// Precache all build assets injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST);

// ─── Background Sync — Offline Order Queue ───────────────────────────────────

self.addEventListener('sync', (event) => {
    if (event.tag === 'pos-order-queue') {
        event.waitUntil(flushOrderQueue());
    }
});

async function flushOrderQueue() {
    const { openDB } = await import('idb');
    const db = await openDB('foodpos-queue', 1);
    const tx = db.transaction('pending-orders', 'readwrite');
    const store = tx.objectStore('pending-orders');
    const all = await store.getAll();

    for (const item of all) {
        if (item.status !== 'pending') continue;

        try {
            const response = await fetch('/pos/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': item.payload._token ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify(item.payload),
            });

            if (response.ok) {
                await store.put({ ...item, status: 'synced' });
            } else {
                await store.put({ ...item, status: 'failed' });
            }
        } catch {
            await store.put({ ...item, status: 'failed' });
        }
    }

    await tx.done;
}

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const title = data.title ?? 'FoodPOS';
    const options = {
        body: data.body ?? '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: { url: data.url ?? '/' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Focus existing window if already open at this URL
                for (const client of windowClients) {
                    if (client.url === targetUrl && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open a new window
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            }),
    );
});
