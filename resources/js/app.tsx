import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

// Register the service worker produced by vite-plugin-pwa.
// autoUpdate is enabled in vite.config.js so the SW updates silently on new deploys.
registerSW({
    onNeedRefresh() {
        // The new SW is waiting — in autoUpdate mode this fires briefly before it takes over.
        // No user action needed; the SW will reload automatically.
    },
    onOfflineReady() {
        // Assets are precached and the app is ready for offline use.
        console.info('[PWA] App is ready for offline use.');
    },
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
