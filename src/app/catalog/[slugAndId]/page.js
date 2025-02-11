'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';

// Helper: extract the product ID from a slug like "product-name-<id>"
function extractId(slugAndId) {
    const parts = slugAndId.split('-');
    return parts[parts.length - 1];
}

export default function ProductPage() {
    const { slugAndId } = useParams();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const { addToCart } = useCart();

    useEffect(() => {
        async function fetchProduct() {
            const id = extractId(slugAndId);
            try {
                const res = await fetch(`/api/catalog/${id}`);
                const data = await res.json();
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [slugAndId]);

    if (loading) return <div>Loading product details...</div>;
    if (!product) return <div>Product not found</div>;

    const variation = product.itemData?.variations?.[0];
    const priceMoney =
        variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.defaultUnitCost;

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
            <button onClick={() => (addToCart(product), console.log('added to cart'))}>Add to Cart</button>
            {/* Optionally, include a Buy Now button to bypass the cart if desired */}
        </div>
    );
}
