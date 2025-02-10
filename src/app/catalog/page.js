'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Simple slugify helper: converts a string to lower-case, replaces spaces with dashes,
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export default function CatalogPage() {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCatalog() {
            try {
                const res = await fetch('/api/catalog');
                const data = await res.json();
                // We expect data.objects to contain the enriched catalog items.
                setCatalog(data.objects || data);
            } catch (err) {
                console.error('Error fetching catalog:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCatalog();
    }, []);

    if (loading) return <div>Loading catalog items...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Catalog Items</h1>
            <ul>
                {catalog.map((item) => {
                    const name = item.itemData?.name || 'Unnamed Item';
                    // Generate a slug from the product name and combine it with the ID.
                    const slug = slugify(name);
                    const href = `/catalog/${slug}-${item.id}`;
                    return (
                        <li key={item.id} style={{ marginBottom: '1rem' }}>
                            <h2>
                                <Link href={href}>{name}</Link>
                            </h2>
                            <p>{item.itemData?.description || 'No Description'}</p>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={name} style={{ maxWidth: '200px' }} />
                            ) : (
                                <p>No image available</p>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
