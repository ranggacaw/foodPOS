import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // Don't inject the SW registration script — we do it manually in app.tsx
            injectRegister: null,
            // Serve the SW from the web root so it can control scope '/'
            scope: '/',
            base: '/',
            manifest: {
                name: 'FoodPOS',
                short_name: 'FoodPOS',
                description: 'Food Point-of-Sale system for restaurants',
                start_url: '/pos',
                scope: '/',
                display: 'standalone',
                background_color: '#f3f4f6',
                theme_color: '#1d4ed8',
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-maskable-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                // Serve offline.html for any navigation request that fails
                navigateFallback: '/offline.html',
                // Only apply navigateFallback to HTML navigation requests
                navigateFallbackDenylist: [/^\/api\//],
                // Precache Vite-hashed JS, CSS, and HTML assets
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
                // Don't precache the offline page itself via glob (it's set as navigateFallback)
                globIgnores: ['offline.html'],
                // Ensure the SW controls the full origin
                swDest: 'public/sw.js',
            },
        }),
    ],
});
