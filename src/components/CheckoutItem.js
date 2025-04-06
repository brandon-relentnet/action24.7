const CheckoutItem = ({ item }) => {
    const {
        basePriceMoney = {},
        quantity: qty = 1,
        uid,
        name,
        description,
        imageUrl,
        metadata = {},
        currency,
    } = item;

    // Get variation name from metadata if available
    const variationName = metadata?.variationName || '';

    const quantity = parseInt(qty) || 1;
    // Price in dollars (as a number)
    const priceNum = basePriceMoney.amount ? basePriceMoney.amount / 100 : 0;
    const formattedPrice = priceNum.toFixed(2);
    const itemTotal = (priceNum * quantity).toFixed(2);

    return (
        <div key={uid} className="flex flex-col sm:flex-row py-4">
            {/* Product Image */}
            <div className="sm:w-1/4 mb-4 sm:mb-0">
                {imageUrl ? (
                    <img src={imageUrl} alt={name || 'Unknown Item'} className="size-16 mx-auto object-cover" />
                ) : (
                    <div className="w-24 h-full bg-gray-100 flex items-center justify-center mx-auto">
                        <p className="text-gray-400 text-xs">No image</p>
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="sm:w-2/4">
                <h2 className="text-lg font-light mb-1">{name || 'Unknown Item'}</h2>
                {/* Display Size Variation */}
                {variationName && (
                    <p className="text-xs text-gray-500 mt-1">
                        Size: <span className="font-medium">{variationName}</span>
                    </p>
                )}
                <p className="text-sm text-gray-600 mb-4 truncate">
                    {description || 'No description available'}
                </p>

                {/* Quantity */}
                <div >
                </div>
            </div>

            {/* Price */}
            <div className="sm:w-1/4 text-right mt-4 sm:mt-0 flex flex-col items-center">
                <span className="text-sm">Quantity: {quantity}</span>
                <div>
                    <p className="font-light">
                        ${formattedPrice} {currency}
                    </p>
                    {quantity > 1 && (
                        <p className="text-sm text-gray-500">${itemTotal} total</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutItem;