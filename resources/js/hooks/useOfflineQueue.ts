import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PendingOrder {
    id: string;
    payload: any;
    status: 'pending' | 'synced' | 'failed';
    created_at: string;
    synced_at?: string;
    error?: string;
}

interface FoodPOSQueueDB extends DBSchema {
    'pending-orders': {
        key: string;
        value: PendingOrder;
        indexes: {
            'by-status': 'pending' | 'synced' | 'failed';
        };
    };
}

let db: IDBPDatabase<FoodPOSQueueDB> | null = null;
let isFlushing = false;

const DB_NAME = 'foodpos-queue';
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase<FoodPOSQueueDB>> {
    if (!db) {
        db = await openDB<FoodPOSQueueDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('pending-orders')) {
                    const store = db.createObjectStore('pending-orders', { keyPath: 'id' });
                    store.createIndex('by-status', 'status');
                }
            },
        });
    }
    return db;
}

async function enqueue(payload: any): Promise<void> {
    const db = await getDB();
    const id = crypto.randomUUID();
    const pendingOrder: PendingOrder = {
        id,
        payload,
        status: 'pending',
        created_at: new Date().toISOString(),
    };
    await db.add('pending-orders', pendingOrder);

    if (navigator.onLine && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((sw: any) => {
            if ('sync' in sw.registration) {
                sw.registration.sync.register('pos-order-queue').catch((err: any) => {
                    console.error('Sync registration failed:', err);
                    flush();
                });
            } else {
                flush();
            }
        });
    }
}

async function flush(): Promise<void> {
    if (isFlushing || !navigator.onLine) {
        return;
    }

    isFlushing = true;
    try {
        const db = await getDB();
        const tx = db.transaction('pending-orders', 'readwrite');
        const index = tx.store.index('by-status');
        const pendingOrders = await index.getAll('pending');

        for (const order of pendingOrders) {
            try {
                const response = await fetch('/pos/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify(order.payload),
                    credentials: 'include',
                });

                if (response.ok) {
                    await db.put('pending-orders', {
                        ...order,
                        status: 'synced',
                        synced_at: new Date().toISOString(),
                    });
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    await db.put('pending-orders', {
                        ...order,
                        status: 'failed',
                        error: errorData.message || errorData.error || 'Sync failed',
                    });
                }
            } catch (error) {
                console.error('Failed to sync order:', order.id, error);
                await db.put('pending-orders', {
                    ...order,
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Network error',
                });
            }
        }
    } finally {
        isFlushing = false;
    }
}

async function getPendingCount(): Promise<number> {
    const db = await getDB();
    const tx = db.transaction('pending-orders', 'readonly');
    const index = tx.store.index('by-status');
    return await index.count('pending');
}

async function getFailedOrders(): Promise<PendingOrder[]> {
    const db = await getDB();
    const tx = db.transaction('pending-orders', 'readonly');
    const index = tx.store.index('by-status');
    return await index.getAll('failed');
}

async function deleteOrder(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('pending-orders', id);
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        flush();
    });
}

export { enqueue, flush, getPendingCount, getFailedOrders, deleteOrder };
