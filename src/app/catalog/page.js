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
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        async function fetchCatalog() {
            try {
                const res = await fetch('/api/catalog');
                const data = await res.json();
                // We expect data.objects to contain the enriched catalog items.
                setCatalog(data.objects || data);
                setCategories(data.categories);
            } catch (err) {
                console.error('Error fetching catalog:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCatalog();
    }, []);

    // Filter items based on the selected category
    const filteredCatalog = selectedCategory === 'all'
        ? catalog
        : catalog.filter(item =>
            item.itemData?.categories?.some(category => category.id === selectedCategory)
        );

    if (loading) return <div>Loading catalog items...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Catalog Items</h1>

            {/* Category filter buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded cursor-pointer ${selectedCategory === 'all'
                        ? 'bg-fuchsia-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    All Items
                </button>

                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded cursor-pointer ${selectedCategory === category.id
                            ? 'bg-fuchsia-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {category.categoryData?.name || 'Unnamed Category'}
                    </button>
                ))}
            </div>

            {/* Display category information if a specific category is selected */}
            {selectedCategory !== 'all' && (
                <div className="mb-6 p-4 bg-gray-100 rounded">
                    <h2 className="text-xl font-semibold">
                        {categories.find(cat => cat.id === selectedCategory)?.categoryData?.name}
                    </h2>
                    <p>
                        {categories.find(cat => cat.id === selectedCategory)?.categoryData?.description || 'No description available'}
                    </p>
                </div>
            )}

            {/* Display filtered catalog items */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
                {filteredCatalog.map((item) => {
                    const name = item.itemData?.name || 'Unnamed Item';
                    // Generate a slug from the product name and combine it with the ID.
                    const slug = slugify(name);
                    const href = `/catalog/${slug}-${item.id}`;
                    return (
                        <Link href={href} key={item.id} className='relative group block shadow-fuchsia-500/20 shadow-md rounded hover:shadow-xl transition duration-300'>
                            <div className='flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 absolute inset-0 h-full w-full text-white bg-zinc-950/80 p-4 rounded transition duration-300'>
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
                                <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                                    <p>No image available</p>
                                </div>
                            )}
                        </Link>
                    );
                })}

                {filteredCatalog.length === 0 && (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">No items found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}