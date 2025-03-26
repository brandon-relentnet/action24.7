'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CheckoutItem from '@/components/CheckoutItem';

export default function CheckoutConfirmationPage() {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Retrieve order details from localStorage
        const savedOrderDetails = localStorage.getItem('lastOrderDetails');
        if (savedOrderDetails) {
            try {
                const parsedDetails = JSON.parse(savedOrderDetails);
                setOrderDetails(parsedDetails);
            } catch (error) {
                console.error('Error parsing order details:', error);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
                <p className="text-gray-600 text-lg font-light">Loading order information...</p>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-light tracking-wider uppercase mb-8">Order Information Not Found</h1>
                    <p className="text-gray-600 mb-8">
                        We couldn't find your order details. This may happen if you refresh the confirmation page or visit it directly.
                    </p>
                    <Link
                        href="/collection"
                        className="inline-block px-8 py-3 border border-black bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const {
        orderId,
        orderItems,
        customerName,
        customerEmail,
        totalAmount,
        currency,
        orderDate
    } = orderDetails;

    // Format the date
    const formattedDate = new Date(orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-light tracking-wider uppercase mb-4">Thank You For Your Order</h1>
                    <p className="text-gray-600">
                        A confirmation email has been sent to <span className="font-medium">{customerEmail}</span>
                    </p>
                </div>

                <div className="bg-gray-50 p-8 mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h2 className="text-xl font-light tracking-wide mb-4 uppercase">Order Information</h2>
                            <p className="text-gray-600 mb-1">
                                <span className="text-gray-800 font-medium">Order Number:</span> {orderId}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="text-gray-800 font-medium">Date:</span> {formattedDate}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="text-gray-800 font-medium">Customer:</span> {customerName}
                            </p>
                            <p className="text-gray-600">
                                <span className="text-gray-800 font-medium">Email:</span> {customerEmail}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-xl font-light tracking-wide mb-4 uppercase">Payment Summary</h2>
                            <p className="text-gray-600 mb-1">
                                <span className="text-gray-800 font-medium">Payment Method:</span> Credit Card
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="text-gray-800 font-medium">Total:</span> ${(totalAmount / 100).toFixed(2)} {currency}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-light tracking-wide mb-4 uppercase border-b border-gray-200 pb-2">
                            Order Items ({orderItems.length})
                        </h2>

                        <div className="divide-y divide-gray-200">
                            {orderItems.map((item) => (
                                <CheckoutItem key={item.uid} item={item} />
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                            <p className="text-lg font-light">
                                Total: ${(totalAmount / 100).toFixed(2)} {currency}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href="/collection"
                        className="inline-block px-8 py-3 border border-black bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}