import { useEffect, useRef, useState } from 'react';

/** The non-standard BeforeInstallPromptEvent fired by Chrome/Android */
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

/**
 * PwaInstallBanner
 *
 * Listens for the `beforeinstallprompt` event and renders a dismissible
 * "Install App" banner when the browser is eligible to install the PWA.
 * Hides itself after the user either accepts or dismisses the prompt.
 *
 * Note: `beforeinstallprompt` only fires on HTTPS (or localhost).
 * The banner is intentionally invisible on plain HTTP (e.g., Laragon HTTP dev).
 */
export default function PwaInstallBanner() {
    const [visible, setVisible] = useState(false);
    const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            deferredPrompt.current = e as BeforeInstallPromptEvent;
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (!visible) return null;

    const handleInstall = async () => {
        if (!deferredPrompt.current) return;
        await deferredPrompt.current.prompt();
        // Hide after the user responds (accepted or dismissed)
        deferredPrompt.current = null;
        setVisible(false);
    };

    const handleDismiss = () => {
        deferredPrompt.current = null;
        setVisible(false);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-blue-700 px-4 py-3 text-white shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:w-96 sm:rounded-xl">
            {/* Icon */}
            <div className="flex shrink-0 items-center justify-center rounded-lg bg-blue-600 p-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">Install FoodPOS</p>
                <p className="text-xs text-blue-200">Add to home screen for quick access</p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
                <button
                    onClick={handleInstall}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white"
                >
                    Install
                </button>
                <button
                    onClick={handleDismiss}
                    aria-label="Dismiss install banner"
                    className="rounded-md p-1 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
