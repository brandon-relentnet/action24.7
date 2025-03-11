'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
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

    console.log(categories);

    const filteredCatalog = selectedCategory === 'all'
        ? catalog
        : catalog.filter(item =>
            item.itemData?.categories?.some(category => category.id === selectedCategory)
        );

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse text-black font-light tracking-widest uppercase">
                Loading collection...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen px-6 py-12 md:px-12 lg:px-16">
            <h1 className="text-3xl md:text-4xl font-light tracking-wider uppercase mb-12 text-center">Collection</h1>

            {/* Category filter buttons */}
            <div className="mb-12 flex flex-wrap justify-center gap-4">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-6 py-2 border transition-all duration-300 tracking-wider text-sm uppercase ${selectedCategory === 'all'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                >
                    All Items
                </button>

                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-6 py-2 border transition-all duration-300 tracking-wider text-sm uppercase ${selectedCategory === category.id
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300 hover:border-black'
                            }`}
                    >
                        {category.categoryData?.name || 'Unnamed Category'}
                    </button>
                ))}
            </div>

            {/* Display category information if a specific category is selected */}
            {selectedCategory !== 'all' && (
                <div className="mb-16 max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-light tracking-wide mb-4">
                        {categories.find(cat => cat.id === selectedCategory)?.categoryData?.name}
                    </h2>
                </div>
            )}

            {/* Display filtered catalog items */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCatalog.map((item) => {
                    const name = item.itemData?.name || 'Unnamed Item';
                    const slug = slugify(name);
                    const href = `/catalog/${slug}-${item.id}`;
                    const price = item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount / 100 || 'N/A';

                    return (
                        <Link href={href} key={item.id} className="group block">
                            <div className="relative overflow-hidden mb-4">
                                {item.imageUrl ? (
                                    <div className="aspect-[3/4] overflow-hidden">
                                        <img
                                            src={item.imageUrl}
                                            alt={name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                                        <p className="text-gray-400 uppercase text-sm tracking-wider">No image</p>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-500 flex items-center justify-center group-hover:opacity-100">
                                    <span className="border border-white text-white px-6 py-2 text-sm uppercase tracking-wider">
                                        View Details
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-light text-lg tracking-wide group-hover:underline decoration-1 underline-offset-4">
                                    {name}
                                </h3>
                                <p className="text-sm text-gray-700 font-light">
                                    ${typeof price === 'number' ? price.toFixed(2) : price} USD
                                </p>
                            </div>
                        </Link>
                    );
                })}

                {filteredCatalog.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <p className="text-gray-500 italic">No items available in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}