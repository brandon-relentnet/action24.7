'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
    const {
        cartItems,
        incrementQuantity,
        decrementQuantity,
        removeItemCompletely,
        clearCart
    } = useCart();

    // Calculate total in cents
    const total = cartItems.reduce((sum, item) => {
        const variation = item.itemData?.variations?.[0];
        const priceMoney = variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.defaultUnitCost;
        const itemPrice = priceMoney ? Number(priceMoney.amount) : 0;
        return sum + (itemPrice * (item.quantity || 1));
    }, 0);

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light tracking-wider uppercase mb-12 text-center">Shopping Bag</h1>

                {cartItems.length === 0 ? (
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
                            {cartItems.map(item => {
                                const variation = item.itemData?.variations?.[0];
                                const priceMoney = variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.defaultUnitCost;
                                const price = priceMoney ? (priceMoney.amount / 100).toFixed(2) : 'N/A';
                                const quantity = item.quantity || 1;
                                const itemTotal = (price * quantity).toFixed(2);

                                return (
                                    <div key={item.id} className="flex flex-col sm:flex-row py-8 border-t border-gray-200">
                                        {/* Product Image */}
                                        <div className="sm:w-1/4 mb-4 sm:mb-0">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.itemData?.name} className="w-24 h-24 object-cover" />
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                                                    <p className="text-gray-400 text-xs">No image</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="sm:w-2/4">
                                            <h2 className="text-lg font-light mb-1">{item.itemData?.name}</h2>
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {item.itemData?.description || 'No description available'}
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center mb-4">
                                                <span className="text-sm mr-4">Quantity:</span>
                                                <div className="flex items-center border border-gray-200">
                                                    <button
                                                        onClick={() => decrementQuantity(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 h-8 flex items-center justify-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => incrementQuantity(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeItemCompletely(item.id)}
                                                className="text-xs uppercase tracking-wider underline-offset-2 hover:underline"
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
                                <button className="w-full py-3 bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-gray-900">
                                    Proceed to Checkout
                                </button>
                            </Link>

                            <Link href="/collection" className="w-full">
                                <button className="w-full py-3 border border-black text-black uppercase tracking-wider text-sm font-light transition-colors hover:bg-black hover:text-white">
                                    Continue Shopping
                                </button>
                            </Link>

                            <button
                                onClick={clearCart}
                                className="w-full py-3 text-gray-500 uppercase tracking-wider text-sm font-light hover:text-black transition-colors"
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