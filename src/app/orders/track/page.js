'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '@/app/actions/actions';

export default function TrackOrderPage() {
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Check for order ID in URL parameters
    useEffect(() => {
        const orderIdParam = searchParams.get('orderId');
        if (orderIdParam) {
            setOrderId(orderIdParam);
            fetchOrderData(orderIdParam);
        }
    }, [searchParams]);

    // Fetch order data
    const fetchOrderData = async (id) => {
        setLoading(true);
        setError(null);
        setFormSubmitted(true);

        try {
            const orderInfo = await getOrderById(id);
            setOrderData(orderInfo);
        } catch (err) {
            console.error("Error fetching order:", err);
            setError("We couldn't find an order with that ID. Please check and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (orderId.trim()) {
            fetchOrderData(orderId.trim());
        }
    };

    // Map order status to a human-readable format
    const getStatusLabel = (status) => {
        const statusMap = {
            'OPEN': 'Order received',
            'COMPLETED': 'Processing',
            'FULFILLED': 'Shipped',
            'CANCELED': 'Canceled',
        };
        return statusMap[status] || status;
    };

    // Get status step (for progress indicator)
    const getStatusStep = (status) => {
        const stepMap = {
            'OPEN': 1,
            'COMPLETED': 2,
            'FULFILLED': 3,
            'CANCELED': 0,
        };
        return stepMap[status] || 1;
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-light tracking-wider uppercase mb-12 text-center">Track Your Order</h1>

                {/* Order Lookup Form */}
                <div className="mb-12 p-8 border border-gray-100">
                    <h2 className="text-xl font-light tracking-wider mb-6">Enter Your Order Number</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="orderId" className="block text-sm uppercase tracking-wider mb-2">
                                Order ID
                            </label>
                            <input
                                type="text"
                                id="orderId"
                                name="orderId"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                placeholder="Enter your order ID"
                                required
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-gray-900"
                            >
                                Track Order
                            </button>
                        </div>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
                        <p className="text-gray-600">Looking up your order...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-8 border border-red-100 bg-red-50 text-red-700">
                        <p>{error}</p>
                    </div>
                )}

                {/* Order Details */}
                {orderData && !loading && (
                    <div className="border border-gray-100">
                        <div className="p-8 border-b border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-light tracking-wider">Order Status</h2>
                                <span className={`px-3 py-1 text-sm ${orderData.state === 'CANCELED'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                    {getStatusLabel(orderData.state)}
                                </span>
                            </div>

                            {/* Progress Tracker */}
                            {orderData.state !== 'CANCELED' && (
                                <div className="mb-8">
                                    <div className="relative">
                                        <div className="h-1 w-full bg-gray-200">
                                            <div
                                                className="h-1 bg-black transition-all duration-500"
                                                style={{ width: `${getStatusStep(orderData.state) * 33}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between mt-2">
                                            <div className={`text-xs uppercase ${getStatusStep(orderData.state) >= 1 ? 'text-black' : 'text-gray-400'}`}>
                                                Order Received
                                            </div>
                                            <div className={`text-xs uppercase ${getStatusStep(orderData.state) >= 2 ? 'text-black' : 'text-gray-400'}`}>
                                                Processing
                                            </div>
                                            <div className={`text-xs uppercase ${getStatusStep(orderData.state) >= 3 ? 'text-black' : 'text-gray-400'}`}>
                                                Shipped
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Info */}
                            <div className="space-y-4">
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-light">{orderData.id}</span>
                                </div>

                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Order Date:</span>
                                    <span className="font-light">
                                        {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>

                                {orderData.fulfillments && orderData.fulfillments.length > 0 && (
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-600">Shipping Address:</span>
                                        <span className="font-light text-right">
                                            {orderData.fulfillments[0].shipmentDetails?.recipient?.displayName}<br />
                                            {orderData.fulfillments[0].shipmentDetails?.recipient?.address?.addressLine1}<br />
                                            {orderData.fulfillments[0].shipmentDetails?.recipient?.address?.locality}, {' '}
                                            {orderData.fulfillments[0].shipmentDetails?.recipient?.address?.administrativeDistrictLevel1} {' '}
                                            {orderData.fulfillments[0].shipmentDetails?.recipient?.address?.postalCode}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-light">
                                        ${Number(orderData.totalMoney?.amount) / 100} {orderData.totalMoney?.currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-8">
                            <h3 className="text-lg font-light tracking-wider mb-6">Order Items</h3>

                            <div className="space-y-6">
                                {orderData.lineItems?.map((item, index) => (
                                    <div key={index} className="flex justify-between border-b border-gray-100 pb-4">
                                        <div>
                                            <p className="font-light">{item.name}</p>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-light">
                                                ${Number(item.basePriceMoney?.amount) / 100} each
                                            </p>
                                            {Number(item.quantity) > 1 && (
                                                <p className="text-sm text-gray-500">
                                                    ${(Number(item.basePriceMoney?.amount) * Number(item.quantity)) / 100} total
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* No Results State */}
                {formSubmitted && !orderData && !loading && !error && (
                    <div className="text-center py-12 border border-gray-100">
                        <p className="text-gray-600 mb-6">No order found with the provided ID.</p>
                        <p className="text-sm text-gray-500 mb-6">
                            Please check that you've entered the correct order ID and try again.
                        </p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-2 border border-black bg-black text-white text-sm uppercase tracking-wider transition-colors hover:bg-white hover:text-black"
                        >
                            Return to Home
                        </Link>
                    </div>
                )}

                {/* Additional Actions */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-6">
                        Having issues with your order? Contact our customer support.
                    </p>
                    <a
                        href="mailto:Action24.7@yahoo.com"
                        className="inline-block text-black hover:underline"
                    >
                        Action24.7@yahoo.com
                    </a>
                </div>
            </div>
        </div>
    );
}