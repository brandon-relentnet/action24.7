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

    // Helper function to get the image URL for an item via the API route.
    async function fetchImageUrl(imageId) {
        try {
            const res = await fetch(`/api/image/${imageId}`);
            const data = await res.json();
            return data.url;
        } catch (error) {
            console.error(`Error fetching image URL for ${imageId}:`, error);
            return null;
        }
    }

    // Local state for image URLs
    const [images, setImages] = useState({});

    useEffect(() => {
        async function loadImages() {
            const newImages = {};
            for (const item of catalog) {
                const imageIds = item.itemData?.imageIds;
                if (imageIds && imageIds.length > 0) {
                    // For simplicity, take the first imageId
                    const url = await fetchImageUrl(imageIds[0]);
                    if (url) {
                        newImages[item.id] = url;
                    }
                }
            }
            setImages(newImages);
        }
        if (catalog.length > 0) {
            loadImages();
        }
    }, [catalog]);

    if (loading) return <div>Loading catalog items...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Catalog Items</h1>
            <ul>
                {catalog.map((item) => (
                    <li key={item.id} style={{ marginBottom: '1rem' }}>
                        <h2>{item.itemData?.name || 'Unnamed Item'}</h2>
                        <p>{item.itemData?.description || 'No Description'}</p>
                        {images[item.id] ? (
                            <img src={images[item.id]} alt={item.itemData?.name} style={{ maxWidth: '200px' }} />
                        ) : (
                            <p>No image available</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
