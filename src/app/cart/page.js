'use client';

import { useSquareOrder } from '@/app/context/SquareOrderContext';
import Link from 'next/link';

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

export default function CartPage() {
    const {
        orderItems,
        updateItemQuantity,
        removeItemFromOrder,
        clearOrder,
        isLoading,
        orderCalculation,
    } = useSquareOrder();

    // Retrieve subtotal and currency from the order calculation (values in cents)
    const subTotal = orderCalculation?.order?.subTotal?.amount || 0;
    const currency = orderCalculation?.order?.subTotal?.currency || 'USD';

    // Calculate tax and total amounts in cents
    const taxTotal = subTotal * 0.0825;
    const totalAmount = subTotal + taxTotal;

    // Helper component for rendering each cart item
    const CartItem = ({ item }) => {
        const {
            basePriceMoney = {},
            quantity: qty = 1,
            uid,
            name,
            description,
            imageUrl,
            metadata = {}
        } = item;

        // Get variation name from metadata if available
        const variationName = metadata?.variationName || '';

        const quantity = parseInt(qty) || 1;
        // Price in dollars (as a number)
        const priceNum = basePriceMoney.amount ? basePriceMoney.amount / 100 : 0;
        const formattedPrice = priceNum.toFixed(2);
        const itemTotal = (priceNum * quantity).toFixed(2);
        const slug = slugify(name);
        const href = `/collection/${slug}-${item.id}`;

        return (
            <div key={uid} className="flex flex-col sm:flex-row py-8 border-t border-gray-200">
                {/* Product Image */}
                <div className="sm:w-1/4 mb-4 sm:mb-0">
                    {imageUrl ? (
                        <a href={href}>
                            <img src={imageUrl} alt={name || 'Unknown Item'} className="w-24 h-full mx-auto object-cover" />
                        </a>
                    ) : (
                        <div className="w-24 h-full bg-gray-100 flex items-center justify-center mx-auto">
                            <p className="text-gray-400 text-xs">No image</p>
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="sm:w-2/4">
                    <a href={href} className="text-lg font-light mb-1">{name || 'Unknown Item'}</a>

                    {/* Display Size Variation */}
                    {variationName && (
                        <p className="text-sm text-gray-600 mt-1 mb-2">
                            Size: <span className="font-medium">{variationName}</span>
                        </p>
                    )}

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {description || 'No description available'}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center">
                        <span className="text-sm mr-4">Quantity:</span>
                        <div className="flex items-center border border-gray-200">
                            <button
                                onClick={() => handleDecrement(uid)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                                disabled={isLoading}
                            >
                                -
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center">{quantity}</span>
                            <button
                                onClick={() => handleIncrement(uid)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                                disabled={isLoading}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="sm:w-1/4 text-right mt-4 sm:mt-0 flex flex-col justify-between items-center">
                    <div>
                        <p className="font-light">
                            ${formattedPrice} {currency}
                        </p>
                        {quantity > 1 && (
                            <p className="text-sm text-gray-500">${itemTotal} total</p>
                        )}
                    </div>
                    <button
                        onClick={() => removeItemFromOrder(uid)}
                        className="text-xs uppercase tracking-wider underline-offset-2 hover:underline"
                        disabled={isLoading}
                    >
                        Remove
                    </button>
                </div>
            </div>
        );
    };

    // Increment quantity handler
    const handleIncrement = (lineItemId) => {
        const item = orderItems.find((item) => item.uid === lineItemId);
        if (item) {
            const currentQuantity = parseInt(item.quantity) || 1;
            updateItemQuantity(lineItemId, currentQuantity + 1);
        }
    };

    // Decrement quantity handler; if quantity is 1, remove the item
    const handleDecrement = (lineItemId) => {
        const item = orderItems.find((item) => item.uid === lineItemId);
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
                <h1 className="text-3xl font-light tracking-wider uppercase mb-12 text-center">
                    Shopping Bag
                </h1>

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
                    <>
                        {/* Cart Items */}
                        <div className="mb-12 border-b border-gray-200">
                            {orderItems.map((item) => (
                                <CartItem key={item.uid} item={item} />
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mb-12">
                            <div className="flex justify-between py-4 border-b border-gray-200">
                                <span className="font-light">Subtotal</span>
                                <span className="font-light">${(subTotal / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-4 border-b border-gray-200">
                                <span className="font-light">Taxes (8.25%)</span>
                                <span className="font-light">${(taxTotal / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-4 text-lg">
                                <span className="font-light">Total</span>
                                <span className="font-light">
                                    ${(totalAmount / 100).toFixed(2)} {currency}
                                </span>
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
                    </>
                )}
            </div>
        </div>
    );
}