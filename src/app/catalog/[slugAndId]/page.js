'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Helper: extract the product ID from a string like "frieza-1-I4U7I62SE7SKMEIHYENEZAI2".
// Assumes the ID is the last hyphen-separated part.
function extractId(slugAndId) {
    const parts = slugAndId.split('-');
    return parts[parts.length - 1];
}

export default function ProductPage() {
    const { slugAndId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const productId = extractId(slugAndId);
        async function fetchProduct() {
            try {
                // For simplicity, we fetch the full catalog and find the product by its ID.
                // In a production app, you might implement an API endpoint that returns a single product.
                const res = await fetch('/api/catalog');
                const data = await res.json();
                const products = data.objects || data;
                const found = products.find(item => item.id === productId);
                setProduct(found);
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [slugAndId]);

    if (loading) return <div>Loading product...</div>;
    if (!product) return <div>Product not found</div>;

    const variation = product.itemData?.variations?.[0];
    const priceMoney = variation?.item_variation_data?.price_money;

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
                {priceMoney ? priceMoney.amount / 100 : 'N/A'}{' '}
                {priceMoney?.currency || ''}
            </p>
            {/* Add your checkout button here (see previous example for checkout API integration) */}
            <button>Buy Now</button>
        </div>
    );
}
