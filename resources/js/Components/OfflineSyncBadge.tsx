import { useEffect, useState } from 'react';
import { getPendingCount } from '@/hooks/useOfflineQueue';

export default function OfflineSyncBadge() {
    const [pendingCount, setPendingCount] = useState<number>(0);

    useEffect(() => {
        const updateCount = async () => {
            const count = await getPendingCount();
            setPendingCount(count);
        };

        updateCount();

        const interval = setInterval(updateCount, 5000);

        window.addEventListener('online', updateCount);
        window.addEventListener('offline', updateCount);

        return () => {
            clearInterval(interval);
            window.removeEventListener('online', updateCount);
            window.removeEventListener('offline', updateCount);
        };
    }, []);

    if (pendingCount === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-3 text-sm text-orange-800 shadow-lg">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-medium">
                    {pendingCount} order{pendingCount !== 1 ? 's' : ''} syncing...
                </span>
            </div>
        </div>
    );
}
