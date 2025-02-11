'use client';

import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
    const { cartItems, removeFromCart, clearCart } = useCart();

    // Calculate total in cents.
    const total = cartItems.reduce((sum, item) => {
        const variation = item.itemData?.variations?.[0];
        const priceMoney = variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.defaultUnitCost;
        return sum + (priceMoney ? Number(priceMoney.amount) : 0);
    }, 0);

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Your Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty. <Link href="/catalog">Go shopping</Link></p>
            ) : (
                <>
                    <ul>
                        {cartItems.map(item => (
                            <li key={item.id} style={{ marginBottom: '1rem' }}>
                                <h2>{item.itemData?.name}</h2>
                                <p>{item.itemData?.description}</p>
                                <p>
                                    Price: {(item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount / 100) || 'N/A'} USD
                                </p>
                                <button onClick={() => removeFromCart(item.id)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <h2>Total: ${(total / 100).toFixed(2)} USD</h2>
                    <Link href="/checkout">
                        <button>Proceed to Checkout</button>
                    </Link>
                    <button onClick={clearCart}>Clear Cart</button>
                </>
            )}
        </div>
    );
}
