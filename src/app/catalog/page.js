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
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 '>
                {catalog.map((item) => {
                    const name = item.itemData?.name || 'Unnamed Item';
                    // Generate a slug from the product name and combine it with the ID.
                    const slug = slugify(name);
                    const href = `/catalog/${slug}-${item.id}`;
                    return (
                        <Link href={href} key={item.id} className='relative group block'>
                            <div className='flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 absolute inset-0 h-full w-full text-white bg-zinc-950/80 p-4 rounded shadow-md transition duration-350'>
                                <h2 className='text-xl font-semibold'>
                                    {name}
                                </h2>
                                <p>{item.itemData?.description || 'No Description'}</p>
                                <p>
                                    ${item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount / 100 || 'N/A'} USD
                                </p>
                            </div>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={name} className='rounded' />
                            ) : (
                                <p>No image available</p>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
