'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Helper: extract the product ID from a slug like "frieza-1-I4U7I62SE7SKMEIHYENEZAI2"
// Assumes the ID is the last hyphen-separated part.
function extractId(slugAndId) {
    const parts = slugAndId.split('-');
    return parts[parts.length - 1];
}

export default function ProductPage() {
    const { slugAndId } = useParams();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);

    // Fetch the full catalog and then filter by product ID.
    useEffect(() => {
        async function fetchProduct() {
            const productId = extractId(slugAndId);
            try {
                const res = await fetch('/api/catalog');
                const data = await res.json();
                // Assuming your enriched catalog returns items in data.objects.
                const products = data.objects || data;
                const found = products.find(item => item.id === productId);
                setProduct(found);
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [slugAndId]);

    const handleBuy = async () => {
        setLoading(true);
        try {
            if (!product) {
                alert('Product not loaded yet');
                return;
            }
            const variation = product.itemData?.variations?.[0];
            if (!variation) {
                alert("Product has no variation available!");
                return;
            }
            // Try to get a price from priceMoney, and if not available, fall back to default_unit_cost.
            const priceMoney = variation.itemVariationData.priceMoney || variation.itemVariationData.default_unit_cost;
            if (!priceMoney) {
                alert("Price information is missing!");
                return;
            }
            const checkoutData = {
                itemId: product.id,
                variationId: variation.id,
                name: product.itemData?.name,
                price: priceMoney.amount, // in cents
                currency: priceMoney.currency,
                quantity: 1,
            };

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutData),
            });

            const data = await res.json();
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                alert("Failed to initiate checkout");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Error creating checkout");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading product details...</div>;
    if (!product) return <div>Product not found</div>;

    const variation = product.itemData?.variations?.[0];
    // Get price from priceMoney or default_unit_cost.
    const priceMoney = variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.default_unit_cost;

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
                Price: {priceMoney ? priceMoney.amount / 100 : 'N/A'} {priceMoney?.currency || ''}
            </p>
            <button onClick={handleBuy} disabled={loading}>
                {loading ? "Processing..." : "Buy Now"}
            </button>
        </div>
    );
}
