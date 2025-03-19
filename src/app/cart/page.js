'use client';

import { useSquareOrder } from '@/app/context/SquareOrderContext';
import Link from 'next/link';

export default function CartPage() {
    const {
        orderItems,
        updateItemQuantity,
        removeItemFromOrder,
        clearOrder,
        isLoading
    } = useSquareOrder();

    console.log('Order Items:', orderItems);

    // Calculate total in cents
    const total = orderItems.reduce((sum, item) => {
        const basePriceMoney = item.basePriceMoney || {};
        const itemPrice = basePriceMoney.amount ? Number(basePriceMoney.amount) : 0;
        return sum + (itemPrice * (parseInt(item.quantity) || 1));
    }, 0);

    const handleIncrement = (lineItemId) => {
        const item = orderItems.find(item => item.uid === lineItemId);
        if (item) {
            const currentQuantity = parseInt(item.quantity) || 1;
            updateItemQuantity(lineItemId, currentQuantity + 1);
        }
    };

    const handleDecrement = (lineItemId) => {
        const item = orderItems.find(item => item.uid === lineItemId);
        if (item) {
            const currentQuantity = parseInt(item.quantity) || 1;
            if (currentQuantity > 1) {
                updateItemQuantity(lineItemId, currentQuantity - 1);
            } else {
                removeItemFromOrder(lineItemId);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light tracking-wider uppercase mb-12 text-center">Shopping Bag</h1>

                {isLoading && (
                    <div className="text-center py-6">
                        <p className="text-gray-600">Loading your cart...</p>
                    </div>
                )}

                {!isLoading && orderItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-8">Your shopping bag is empty.</p>
                        <Link
                            href="/collection"
                            className="inline-block px-8 py-3 border border-black bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div>
                        {/* Cart Items */}
                        <div className="mb-12 border-b border-gray-200">
                            {orderItems.map(item => {
                                const basePriceMoney = item.basePriceMoney || {};
                                const price = basePriceMoney.amount ? (basePriceMoney.amount / 100).toFixed(2) : 'N/A';
                                const quantity = parseInt(item.quantity) || 1;
                                const itemTotal = (price * quantity).toFixed(2);

                                // Square orders store item name directly
                                const itemName = item.name || 'Unknown Item';

                                // Get image from catalog item data if available
                                // Note: You'll need to ensure your API returns the image URL in the line item
                                const imageUrl = item.imageUrl || null;

                                return (
                                    <div key={item.uid} className="flex flex-col sm:flex-row py-8 border-t border-gray-200">
                                        {/* Product Image */}
                                        <div className="sm:w-1/4 mb-4 sm:mb-0">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={itemName} className="w-24 h-24 object-cover" />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                                                    <p className="text-gray-400 text-xs">No image</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="sm:w-2/4">
                                            <h2 className="text-lg font-light mb-1">{itemName}</h2>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {item.note || 'No description available'}
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center mb-4">
                                                <span className="text-sm mr-4">Quantity:</span>
                                                <div className="flex items-center border border-gray-200">
                                                    <button
                                                        onClick={() => handleDecrement(item.uid)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                                                        disabled={isLoading}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 h-8 flex items-center justify-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleIncrement(item.uid)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                                                        disabled={isLoading}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeItemFromOrder(item.uid)}
                                                className="text-xs uppercase tracking-wider underline-offset-2 hover:underline"
                                                disabled={isLoading}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="sm:w-1/4 text-right mt-4 sm:mt-0">
                                            <p className="font-light">${price} USD</p>
                                            {quantity > 1 && (
                                                <p className="text-sm text-gray-500">
                                                    ${itemTotal} total
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="mb-12">
                            <div className="flex justify-between py-4 border-b border-gray-200">
                                <span className="font-light">Subtotal</span>
                                <span className="font-light">${(total / 100).toFixed(2)} USD</span>
                            </div>
                            <div className="flex justify-between py-4 border-b border-gray-200">
                                <span className="font-light">Shipping</span>
                                <span className="font-light">Free</span>
                            </div>
                            <div className="flex justify-between py-4 text-lg">
                                <span className="font-light">Total</span>
                                <span className="font-light">${(total / 100).toFixed(2)} USD</span>
                            </div>
                        </div>

                        {/* Checkout Buttons */}
                        <div className="flex flex-col space-y-4">
                            <Link href="/checkout" className="w-full">
                                <button
                                    className="w-full py-3 bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-gray-900"
                                    disabled={isLoading}
                                >
                                    Proceed to Checkout
                                </button>
                            </Link>

                            <Link href="/collection" className="w-full">
                                <button className="w-full py-3 border border-black text-black uppercase tracking-wider text-sm font-light transition-colors hover:bg-black hover:text-white">
                                    Continue Shopping
                                </button>
                            </Link>

                            <button
                                onClick={clearOrder}
                                className="w-full py-3 text-gray-500 uppercase tracking-wider text-sm font-light hover:text-black transition-colors"
                                disabled={isLoading}
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}