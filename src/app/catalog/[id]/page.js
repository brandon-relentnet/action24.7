// File: src/app/catalog/[id]/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductPage({ params, product }) {
    // Assume that 'product' is provided via server-side props or fetched from your catalog API.
    // For this example, we'll assume the product object includes:
    // - product.itemData.name
    // - product.itemData.description
    // - product.itemData.variations (an array; we use the first variation)
    // - product.imageUrl (from your enriched catalog)

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleBuy = async () => {
        setLoading(true);
        try {
            // For simplicity, we assume quantity 1.
            const variation = product.itemData?.variations?.[0];
            if (!variation) {
                alert("Product has no variation available!");
                return;
            }
            const { price_money } = variation.item_variation_data;

            const checkoutData = {
                itemId: product.id,
                variationId: variation.id,
                name: product.itemData?.name,
                price: price_money.amount, // in cents
                currency: price_money.currency,
                quantity: 1,
            };

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkoutData),
            });

            const data = await res.json();
            if (data.checkoutUrl) {
                // Redirect the user to the hosted checkout page.
                window.location.href = data.checkoutUrl;
            } else {
                alert("Failed to initiate checkout");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating checkout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>{product.itemData?.name}</h1>
            <p>{product.itemData?.description}</p>
            {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.itemData?.name} style={{ maxWidth: '200px' }} />
            ) : (
                <p>No image available</p>
            )}
            <p>
                Price:{' '}
                {product.itemData?.variations?.[0]?.item_variation_data?.price_money?.amount / 100}{' '}
                {product.itemData?.variations?.[0]?.item_variation_data?.price_money?.currency}
            </p>
            <button onClick={handleBuy} disabled={loading}>
                {loading ? "Processing..." : "Buy Now"}
            </button>
        </div>
    );
}
