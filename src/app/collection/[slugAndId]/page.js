'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSquareOrder } from '@/app/context/SquareOrderContext'; 
import Link from 'next/link';

function extractId(slugAndId) {
    const parts = slugAndId.split('-');
    return parts[parts.length - 1];
}

export default function ProductPage() {
    const { slugAndId } = useParams();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const { addItemToOrder, orderItems, isLoading } = useSquareOrder();
    const [openAttribute, setOpenAttribute] = useState(null);
    const detailsRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToOrder = async () => {
        if (isInOrder || isLoading) return;
        setAddingToCart(true);

        try {
            await addItemToOrder(product);
            window.location.href = '/cart';
        } catch (error) {
            console.error('Error adding to order:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    // Check if product is in order already
    const isInOrder = product && orderItems.some(item => {
        // You may need to match differently depending on how Square returns line items
        const variation = product.itemData?.variations?.[0];
        return item.catalogObjectId === variation?.id;
    });

    // Scroll to details section
    const scrollToDetails = () => {
        if (detailsRef.current) {
            detailsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Toggle attribute dropdown
    const toggleAttribute = (attributeName) => {
        if (openAttribute === attributeName) {
            setOpenAttribute(null);
        } else {
            setOpenAttribute(attributeName);
        }
    };

    // Toggle fullscreen image
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Close fullscreen on escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'auto'; // Restore scrolling
        }

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullscreen]);

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

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="animate-pulse text-black font-light tracking-widest uppercase">
                Loading product details...
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 py-12">
            <h1 className="text-2xl font-light tracking-wider uppercase mb-6">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for is no longer available.</p>
            <Link href="/catalog" className="px-8 py-2 border border-black bg-black text-white uppercase tracking-wider text-sm transition-colors hover:bg-white hover:text-black">
                Return to Collection
            </Link>
        </div>
    );

    const variation = product.itemData?.variations?.[0];
    const priceMoney =
        variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.defaultUnitCost;
    const price = priceMoney ? (priceMoney.amount / 100).toFixed(2) : 'N/A';
    const currency = priceMoney?.currency || 'USD';

    return (
        <div className="min-h-screen bg-white text-black py-12">
            {/* Fullscreen Image Modal */}
            {isFullscreen && product.imageUrl && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-10"
                    onClick={toggleFullscreen}
                >
                    <button
                        className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"
                        onClick={toggleFullscreen}
                        aria-label="Close fullscreen view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={product.imageUrl}
                            alt={product.itemData?.name}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link href="/catalog" className="text-sm text-gray-500 hover:text-black transition-colors">
                        Collection
                    </Link>
                    <span className="text-sm text-gray-500 mx-2">/</span>
                    <span className="text-sm">{product.itemData?.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Product Image */}
                    <div
                        className="aspect-square bg-gray-50 cursor-zoom-in relative group"
                        onClick={product.imageUrl ? toggleFullscreen : undefined}
                    >
                        {product.imageUrl ? (
                            <>
                                <img
                                    src={product.imageUrl}
                                    alt={product.itemData?.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="bg-white/90 py-2 px-4">
                                        <span className="text-xs uppercase tracking-wider">Click to enlarge</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center border border-gray-100">
                                <p className="text-gray-400 uppercase text-sm tracking-wider">No image available</p>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-light tracking-wide mb-4">
                            {product.itemData?.name}
                        </h1>

                        <div className="text-xl mb-8">
                            {price !== 'N/A' ? (
                                <span>${price} {currency}</span>
                            ) : (
                                <span className="text-gray-500">Price on request</span>
                            )}
                        </div>

                        <div className="prose prose-sm mb-8 text-gray-700">
                            {product.itemData?.descriptionHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: product.itemData.descriptionHtml }} />
                            ) : (
                                'No description available.'
                            )}
                        </div>

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={handleAddToOrder}
                                disabled={isInOrder || addingToCart}
                                className={`w-full py-3 uppercase tracking-wider text-sm font-light transition-all duration-300 ${addingToCart
                                        ? "bg-gray-700 text-white"
                                        : isInOrder
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-black text-white hover:bg-gray-900"
                                    }`}
                            >
                                {addingToCart
                                    ? "Adding to Cart..."
                                    : isInOrder
                                        ? "Already in Cart"
                                        : "Add to Cart"
                                }
                            </button>

                            <button
                                onClick={scrollToDetails}
                                className="w-full py-3 border border-black text-black uppercase tracking-wider text-sm font-light transition-colors hover:bg-black hover:text-white"
                            >
                                Product Details
                            </button>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-sm uppercase tracking-wider">Shipping</span>
                                <span className="text-sm">Free worldwide shipping</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-sm uppercase tracking-wider">Returns</span>
                                <span className="text-sm">30-day return policy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Attributes Section */}
                <div ref={detailsRef} className="mt-24 pt-12 border-t border-gray-200">
                    <h2 className="text-2xl font-light tracking-wide mb-12 text-center uppercase">Product Details</h2>

                    <div className="max-w-3xl mx-auto">
                        {Object.entries(product.customAttributeValues || {}).map(([key, value]) => (
                            <div key={key} className="mb-6 border-b border-gray-100">
                                <button
                                    onClick={() => toggleAttribute(value.name)}
                                    className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
                                >
                                    <span className="text-base uppercase tracking-wider font-light">{value.name}</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform duration-500 ${openAttribute === value.name ? 'transform rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Content with Animation */}
                                <div
                                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openAttribute === value.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="py-4 pl-4 pr-6 text-gray-600">
                                        {value.name === "Features" || value.name === "Materials" ? (
                                            <ul className="space-y-2 list-none">
                                                {value.stringValue.split(/\s+(?=[A-Z])/).map((feature, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <div>
                                                            <span className="mr-2 text-sm">&#8212;</span>
                                                            <p className='inline-block'>{feature}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div>
                                                <span className="mr-2 text-sm">&#8212;</span>
                                                <p className='inline-block'>{value.stringValue}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}