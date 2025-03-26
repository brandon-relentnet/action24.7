"use client";
import { useSquareOrder } from '@/app/context/SquareOrderContext';
import { useState } from 'react';

export default function ShippingPage() {
    const {
        addShippingToOrder,
        orderCalculation,
        updateOrderState,
        orderId,
        versionId
    } = useSquareOrder();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [debugResponse, setDebugResponse] = useState(null);

    // Define the shipping item details
    const shippingItem = {
        name: "Standard Shipping",
        basePriceMoney: {
            amount: 1199,  // $11.99
            currency: "USD",
        },
        itemType: "CUSTOM_AMOUNT"
    };

    // Add shipping directly through API
    async function addShippingManually() {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setDebugResponse(null);

        try {
            // Call the API endpoint directly
            const response = await fetch(`/api/orders/${orderId}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add_shipping',
                    itemData: shippingItem,
                    versionId: versionId || orderCalculation?.order?.version || 1
                }),
            });

            const data = await response.json();
            setDebugResponse(data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add shipping');
            }

            setSuccess(true);
            // Refresh order data
            if (orderId) {
                await updateOrderState(orderId);
            }
        } catch (err) {
            console.error("Error adding shipping manually:", err);
            setError(err.message || "Failed to add shipping");
        } finally {
            setLoading(false);
        }
    }

    // Add shipping using context method
    async function addShippingViaContext() {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setDebugResponse(null);

        try {
            const result = await addShippingToOrder(shippingItem);
            setDebugResponse(result);
            setSuccess(true);

            // Refresh order data
            if (orderId) {
                await updateOrderState(orderId);
            }
        } catch (err) {
            console.error("Error adding shipping via context:", err);
            setError(err.message || "Failed to add shipping via context");
        } finally {
            setLoading(false);
        }
    }

    // Get order version from calculation
    const orderVersion = orderCalculation?.order?.version;
    const orderTotal = orderCalculation?.order?.totalMoney?.amount || 0;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-semibold mb-4">Shipping Test</h1>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-medium mb-4">Order Information</h2>
                    <p className="mb-2">Order ID: <code className="bg-gray-100 p-1">{orderId || 'No active order'}</code></p>
                    <p className="mb-2">Order Version: <code className="bg-gray-100 p-1">{versionId || orderVersion || 'Unknown'}</code></p>
                    <p className="mb-4">Order Total: ${(orderTotal / 100).toFixed(2)}</p>

                    <div className="flex space-x-4 mb-4">
                        <button
                            onClick={addShippingManually}
                            disabled={loading || !orderId}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Via API Directly'}
                        </button>

                        <button
                            onClick={addShippingViaContext}
                            disabled={loading || !orderId}
                            className="bg-black text-white px-4 py-2 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Via Context'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                            <p className="font-bold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                            Shipping added successfully!
                        </div>
                    )}

                    {debugResponse && (
                        <div className="mt-4">
                            <h3 className="font-medium mb-2">API Response:</h3>
                            <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60 text-xs">
                                {JSON.stringify(debugResponse, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-medium mb-4">Order Items</h2>
                    {orderCalculation?.order?.lineItems?.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {orderCalculation.order.lineItems.map((item, index) => (
                                <li key={index} className="py-4">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            <p className="text-sm text-gray-500">Type: {item.itemType}</p>
                                            {item.uid && <p className="text-xs text-gray-400">UID: {item.uid}</p>}
                                        </div>
                                        <p className="font-medium">
                                            ${((item.basePriceMoney?.amount || 0) / 100).toFixed(2)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No items in order</p>
                    )}
                </div>
            </div>
        </div>
    );
}