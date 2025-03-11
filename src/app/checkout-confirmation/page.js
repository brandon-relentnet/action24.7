'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Create a client component that uses useSearchParams
function CheckoutDetails() {
    const searchParams = useSearchParams();
    const [orderNumber, setOrderNumber] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0);

    useEffect(() => {
        // Check if there's an order ID in the URL parameters
        const orderId = searchParams.get('orderId');

        // If no order ID is provided, generate a random one
        if (!orderId) {
            const randomOrderNumber = Math.floor(10000000 + Math.random() * 90000000);
            setOrderNumber(randomOrderNumber);
        } else {
            setOrderNumber(orderId);
        }

        // Retrieve the completed order from localStorage
        const completedOrder = localStorage.getItem('completedOrder');
        if (completedOrder) {
            const parsedOrder = JSON.parse(completedOrder);
            setOrderItems(parsedOrder.items || []);
            setOrderTotal(parsedOrder.total || 0);
        }
    }, [searchParams]);

    // Get current date for the order date
    const orderDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            {/* Order Information */}
            <div className="mb-12 border border-gray-100 p-8">
                <h2 className="text-xl font-light tracking-wider uppercase mb-8 text-center">Order Details</h2>

                <div className="space-y-6">
                    <div className="flex justify-between pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-light">{orderNumber}</span>
                    </div>

                    <div className="flex justify-between pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-light">{orderDate}</span>
                    </div>

                    <div className="flex justify-between pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className="font-light">Paid</span>
                    </div>

                    <div className="flex justify-between pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-light">Free Shipping</span>
                    </div>

                    <div className="flex justify-between pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Estimated Delivery:</span>
                        <span className="font-light">3-5 Business Days</span>
                    </div>

                    <div className="text-right">
                        <span className="text-gray-600 mr-4">Total:</span>
                        <span className="font-light text-lg">${(orderTotal / 100).toFixed(2)} USD</span>
                    </div>
                </div>
            </div>

            {/* Ordered Items */}
            <div className="mb-12 border border-gray-100">
                <h2 className="text-xl font-light tracking-wider uppercase p-8 text-center border-b border-gray-100">
                    Ordered Items
                </h2>

                {orderItems.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {orderItems.map((item) => {
                            const variation = item.itemData?.variations?.[0];
                            const priceMoney = variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.defaultUnitCost;
                            const price = priceMoney ? (priceMoney.amount / 100).toFixed(2) : 'N/A';
                            const quantity = item.quantity || 1;
                            const itemTotal = (price * quantity).toFixed(2);

                            return (
                                <div key={item.id} className="flex p-6">
                                    <div className="w-20 h-20 mr-6">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.itemData?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-xs text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow">
                                        <h3 className="font-light text-base mb-1">{item.itemData?.name}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                                            {item.itemData?.description || 'No description available'}
                                        </p>
                                        {quantity > 1 && (
                                            <p className="text-sm">Quantity: {quantity}</p>
                                        )}
                                    </div>

                                    <div className="text-right ml-4">
                                        <p className="font-light">${price} USD</p>
                                        {quantity > 1 && (
                                            <p className="text-sm text-gray-500">${itemTotal} total</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No items found in this order.
                    </div>
                )}
            </div>
        </>
    );
}

// Create a loading fallback
function CheckoutDetailsFallback() {
    return (
        <div className="mb-12 border border-gray-100 p-8">
            <h2 className="text-xl font-light tracking-wider uppercase mb-8 text-center">Loading Order Details...</h2>
            <div className="space-y-6">
                <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
                <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
                <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
                <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
                <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
            </div>
        </div>
    );
}

// Main component with Suspense boundary
export default function CheckoutConfirmation() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                {/* Success Message */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-light tracking-wider uppercase mb-4">Thank You</h1>
                    <p className="text-gray-600 text-lg">Your order has been confirmed</p>
                </div>

                {/* Wrap the component that uses useSearchParams in Suspense */}
                <Suspense fallback={<CheckoutDetailsFallback />}>
                    <CheckoutDetails />
                </Suspense>

                {/* Next Steps */}
                <div className="mb-16 bg-gray-50 p-8">
                    <h2 className="text-xl font-light tracking-wider uppercase mb-6">What's Next?</h2>

                    <div className="space-y-4 text-gray-700">
                        <p>
                            <span className="inline-block w-6 h-6 rounded-full bg-black text-white text-center leading-6 mr-3">1</span>
                            You will receive an email confirmation shortly.
                        </p>

                        <p>
                            <span className="inline-block w-6 h-6 rounded-full bg-black text-white text-center leading-6 mr-3">2</span>
                            Once your order ships, we'll send you tracking information.
                        </p>

                        <p>
                            <span className="inline-block w-6 h-6 rounded-full bg-black text-white text-center leading-6 mr-3">3</span>
                            Have questions? Contact us at <a href="mailto:Action24.7@yahoo.com" className="text-black hover:underline">Action24.7@yahoo.com</a>
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="/collection" className="w-full md:w-auto">
                        <button className="w-full md:w-auto px-8 py-3 border border-black bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black">
                            Continue Shopping
                        </button>
                    </Link>

                    <Link href={`/orders/`} className="w-full md:w-auto">
                        <button className="w-full md:w-auto px-8 py-3 border border-black text-black uppercase tracking-wider text-sm font-light transition-colors hover:bg-black hover:text-white">
                            Track Order
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}