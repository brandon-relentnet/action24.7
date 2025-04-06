'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSquareOrder } from '@/app/context/SquareOrderContext';
import Link from 'next/link';

// Utility to extract the catalog ID from the URL slug
function extractId(slugAndId) {
    const parts = slugAndId.split('-');
    return parts[parts.length - 1];
}

// Fullscreen image modal component
function FullscreenImageModal({ imageUrl, alt, onClose }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-10"
            onClick={onClose}
        >
            <button
                className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"
                onClick={onClose}
                aria-label="Close fullscreen view"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt={alt} className="max-w-full max-h-full object-contain" />
            </div>
        </div>
    );
}

// Component for displaying the product image with a clickable fullscreen feature
function ProductImage({ product, toggleFullscreen }) {
    return (
        <div className="aspect-square bg-gray-50 cursor-zoom-in relative group" onClick={product.imageUrl ? toggleFullscreen : undefined}>
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
    );
}

// Size selector component
function SizeSelector({ variations, selectedVariation, onVariationChange }) {
    if (!variations || variations.length <= 1) return null;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="size-select" className="text-sm uppercase tracking-wider font-light">
                    Size
                </label>
                {selectedVariation && (
                    <span className="text-sm text-gray-500">
                        {selectedVariation.itemVariationData?.name}
                    </span>
                )}
            </div>
            <select
                id="size-select"
                value={selectedVariation?.id || ''}
                onChange={(e) => {
                    const variationId = e.target.value;
                    const newVariation = variations.find(v => v.id === variationId);
                    onVariationChange(newVariation);
                }}
                className="w-full py-3 px-4 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
                {variations.map((variation) => (
                    <option key={variation.id} value={variation.id}>
                        {variation.itemVariationData?.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

// Component for displaying product details and action buttons
function ProductDetails({
    product,
    selectedVariation,
    onVariationChange,
    handleAddToOrder,
    isInOrder,
    addingToCart,
    scrollToDetails
}) {
    // Get all variations from the product
    const variations = product.itemData?.variations || [];

    // Get pricing details from the selected variation
    const priceMoney = selectedVariation?.itemVariationData?.priceMoney ||
        selectedVariation?.itemVariationData?.defaultUnitCost;
    const price = priceMoney ? (priceMoney.amount / 100).toFixed(2) : 'N/A';
    const currency = priceMoney?.currency || 'USD';

    // Check if selected variation is in stock
    const inStock = selectedVariation?.itemVariationData?.inventoryCount === undefined ||
        selectedVariation?.itemVariationData?.inventoryCount > 0;

    return (
        <div className="flex flex-col">
            <h1 className="text-3xl font-light tracking-wide mb-4">{product.itemData?.name}</h1>
            <div className="text-xl mb-8">
                {price !== 'N/A' ? (
                    <span>${price} {currency}</span>
                ) : (
                    <span className="text-gray-500">Price on request</span>
                )}
            </div>

            {/* Size Selector */}
            <SizeSelector
                variations={variations}
                selectedVariation={selectedVariation}
                onVariationChange={onVariationChange}
            />

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
                    disabled={isInOrder || addingToCart || !inStock}
                    className={`w-full py-3 uppercase tracking-wider text-sm font-light transition-all duration-300 ${!inStock
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : addingToCart
                                ? "bg-gray-700 text-white"
                                : isInOrder
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-900"
                        }`}
                >
                    {!inStock
                        ? "Out of Stock"
                        : addingToCart
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
    );
}

// Component for rendering the product attributes (with dropdown animation)
function AttributesSection({ product, openAttribute, toggleAttribute }) {
    const attributes = Object.entries(product.customAttributeValues || {});
    if (!attributes.length) return null;

    return (
        <div className="mt-24 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-light tracking-wide mb-12 text-center uppercase">Product Details</h2>
            <div className="max-w-3xl mx-auto">
                {attributes.map(([key, value]) => (
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
                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${openAttribute === value.name ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="py-4 pl-4 pr-6 text-gray-600">
                                {value.name === "Features" || value.name === "Materials" ? (
                                    <ul className="space-y-2 list-none">
                                        {value.stringValue.split(/\s+(?=[A-Z])/).map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="mr-2 text-sm">&#8212;</span>
                                                <p className='inline-block'>{feature}</p>
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
    );
}

export default function ProductPage() {
    const { slugAndId } = useParams();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const { addItemToOrder, orderItems, isLoading } = useSquareOrder();
    const [openAttribute, setOpenAttribute] = useState(null);
    const detailsRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    // Set the selected variation when product loads
    useEffect(() => {
        if (product && product.itemData?.variations?.length) {
            setSelectedVariation(product.itemData.variations[0]);
        }
    }, [product]);

    // Handler for adding the product to the order
    const handleAddToOrder = async () => {
        if (!selectedVariation || isInOrder || isLoading) return;

        setAddingToCart(true);
        try {
            // Pass the selected variation to the order context
            await addItemToOrder(product, selectedVariation);
            window.location.href = '/cart';
        } catch (error) {
            console.error('Error adding to order:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    // Check if the selected variation is already in the cart/order
    const isInOrder = selectedVariation && orderItems.some(item =>
        item.catalogObjectId === selectedVariation.id
    );

    // Smooth scroll to product details section
    const scrollToDetails = () => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Toggle attribute dropdown open state
    const toggleAttribute = (attributeName) => {
        setOpenAttribute(openAttribute === attributeName ? null : attributeName);
    };

    // Toggle fullscreen image view
    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

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

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse text-black font-light tracking-widest uppercase">
                    Loading product details...
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6 py-12">
                <h1 className="text-2xl font-light tracking-wider uppercase mb-6">Product Not Found</h1>
                <p className="text-gray-600 mb-8">The product you're looking for is no longer available.</p>
                <Link
                    href="/catalog"
                    className="px-8 py-2 border border-black bg-black text-white uppercase tracking-wider text-sm transition-colors hover:bg-white hover:text-black"
                >
                    Return to Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black py-12">
            {isFullscreen && product.imageUrl && (
                <FullscreenImageModal imageUrl={product.imageUrl} alt={product.itemData?.name} onClose={toggleFullscreen} />
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
                    <ProductImage product={product} toggleFullscreen={toggleFullscreen} />
                    <ProductDetails
                        product={product}
                        selectedVariation={selectedVariation}
                        onVariationChange={setSelectedVariation}
                        handleAddToOrder={handleAddToOrder}
                        isInOrder={isInOrder}
                        addingToCart={addingToCart}
                        scrollToDetails={scrollToDetails}
                    />
                </div>
                <AttributesSection product={product} openAttribute={openAttribute} toggleAttribute={toggleAttribute} />
            </div>
            <div ref={detailsRef} />
        </div>
    );
}