'use client';

import { useEffect, useState } from 'react';

export default function CatalogPage({ catalogData }) {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Assuming your /api/catalog endpoint returns the catalog items.
        async function fetchCatalog() {
            try {
                const res = await fetch('/api/catalog');
                const data = await res.json();
                // Here data.objects should be your list of catalog items.
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
                {catalog.map((item) => (
                    <li key={item.id} style={{ marginBottom: '1rem' }}>
                        <h2>{item.itemData?.name || 'Unnamed Item'}</h2>
                        <p>{item.itemData?.description || 'No Description'}</p>
                        {[item.id] ? (
                            <img src={[item.imageUrl]} alt={item.itemData?.name} style={{ maxWidth: '200px' }} />
                        ) : (
                            <p>No image available</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
