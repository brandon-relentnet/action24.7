'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a simple redirect page for /orders that redirects to the track order page
export default function OrdersPage() {
    const router = useRouter();

    useEffect(() => {
        // Look for a completed order in localStorage
        const completedOrder = localStorage.getItem('completedOrder');

        if (completedOrder) {
            try {
                const orderData = JSON.parse(completedOrder);
                if (orderData.orderId) {
                    // If there's a recent order, redirect to the track page with the order ID
                    router.push(`/orders/track?orderId=${orderData.orderId}`);
                    return;
                }
            } catch (e) {
                console.error('Error parsing stored order:', e);
            }
        }

        // If no completed order found, just redirect to the track page
        router.push('/orders/track');
    }, [router]);

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
                <p className="text-gray-600">Redirecting to order tracking...</p>
            </div>
        </div>
    );
}