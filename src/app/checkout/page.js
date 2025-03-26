'use client';

import { useSquareOrder } from '@/app/context/SquareOrderContext';
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { submitPayment } from '@/app/actions/actions';
import { useState, useEffect, useMemo } from 'react';
import CheckoutItem from '@/components/CheckoutItem';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

let envLocationId;
let envApplicationId;

if (process.env.NEXT_PUBLIC_APP_ENV === 'production') {
    envLocationId = process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_LOCATION_ID;
    envApplicationId = process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_APPLICATION_ID;
} else {
    envLocationId = process.env.NEXT_PUBLIC_SANDBOX_SQUARE_LOCATION_ID;
    envApplicationId = process.env.NEXT_PUBLIC_SANDBOX_SQUARE_APPLICATION_ID;
}

export default function CheckoutPage() {
    const { orderId, orderItems, orderCalculation } = useSquareOrder();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingDistance, setShippingDistance] = useState(null);
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [shippingError, setShippingError] = useState('');
    const [paymentError, setPaymentError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    });

    // Retrieve subtotal and currency from the order calculation (values in cents)
    const subTotal = orderCalculation?.order?.subTotal?.amount || 0;
    const currency = orderCalculation?.order?.subTotal?.currency || 'USD';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const shippingCostInCents = shippingCost * 100;

    const taxTotal = useMemo(() => {
        return 0.0975 * (subTotal + shippingCostInCents);
    }, [subTotal, shippingCostInCents]);

    const totalAmount = useMemo(() => {
        return subTotal + shippingCostInCents + taxTotal;
    }, [subTotal, shippingCostInCents, taxTotal]);

    // Calculate shipping when address is complete
    useEffect(() => {
        const { address, city, state, zipCode, country } = formData;

        // Check if all shipping fields are filled
        const addressComplete = address && city && state && zipCode;

        if (addressComplete) {
            calculateShipping();
        }
    }, [formData.address, formData.city, formData.state, formData.zipCode, formData.country, shippingMethod]);

    useEffect(() => {
        if (shippingDistance !== null) {
            calculateShipping();
        }
    }, [shippingMethod]);

    const calculateShipping = async () => {
        const { address, city, state, zipCode, country } = formData;

        // Validate address fields
        if (!address || !city || !state || !zipCode) {
            return;
        }

        setCalculatingShipping(true);
        setShippingError('');

        try {
            const response = await fetch('/api/shipping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    city,
                    state,
                    zipCode,
                    country,
                    shippingMethod,
                    quantity: orderItems.length || 1
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to calculate shipping');
            }

            setShippingCost(data.shippingCost);
            setShippingDistance(data.distance);
        } catch (error) {
            console.error('Error calculating shipping:', error);
            setShippingError(error.message || 'Error calculating shipping cost');
        } finally {
            setCalculatingShipping(false);
        }
    };

    // Validate the form
    const isFormValid = () => {
        const { email, firstName, lastName, address, city, state, zipCode } = formData;
        return email && firstName && lastName && address && city && state && zipCode && shippingCost > 0 && !calculatingShipping;
    };

    const handlePayment = async (token) => {
        if (!isFormValid()) {
            setPaymentError('Please complete all required fields and ensure shipping is calculated.');
            return;
        }

        setLoading(true);
        setPaymentError('');

        try {
            // Prepare checkout data with shipping information
            const checkoutData = {
                orderId,
                amount: totalAmount,
                currency,
                customerDetails: formData,
                shippingDetails: {
                    method: shippingMethod,
                    cost: shippingCost,
                    distance: shippingDistance
                }
            };

            // Process payment with integrated shipping
            const result = await submitPayment(token.token, checkoutData);

            // Log the result structure to understand the response format
            console.log('Payment result:', result);

            // Check for payment success using multiple possible response structures
            const isPaymentSuccessful =
                // If response has result.payment structure
                (result?.result?.payment) ||
                // Or if response directly has payment property
                (result?.payment) ||
                // Or if Square SDK returns direct payment object
                (result?.id && result?.status);

            if (isPaymentSuccessful) {
                localStorage.removeItem('lastOrderDetails');

                // Store order information in localStorage before clearing
                localStorage.setItem('lastOrderDetails', JSON.stringify({
                    orderId,
                    orderItems,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    totalAmount,
                    currency,
                    orderDate: new Date().toISOString(),
                    shippingCost,
                    shippingMethod,
                }));

                localStorage.removeItem('squareOrderId');
                router.push("/checkout-confirmation");
            } else {
                setPaymentError("Payment processing failed. Please try again.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentError(error.message || "Error processing payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light tracking-wider uppercase mb-12 text-center">Checkout</h1>

                {orderItems.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-8">Your shopping bag is empty.</p>
                        <Link
                            href="/collection"
                            className="inline-block px-8 py-3 border border-black bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Customer Information */}
                        <div>
                            <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Customer Information</h2>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label htmlFor="email" className="block text-sm uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm uppercase tracking-wider mb-2">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm uppercase tracking-wider mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Shipping Address</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="address" className="block text-sm uppercase tracking-wider mb-2">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm uppercase tracking-wider mb-2">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="state" className="block text-sm uppercase tracking-wider mb-2">State</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm uppercase tracking-wider mb-2">Zip Code</label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="country" className="block text-sm uppercase tracking-wider mb-2">Country</label>
                                    <select
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                        required
                                    >
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="FR">France</option>
                                        <option value="DE">Germany</option>
                                        <option value="JP">Japan</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="shippingMethod" className="block text-sm uppercase tracking-wider mb-2">Shipping Method</label>
                                    <select
                                        id="shippingMethod"
                                        name="shippingMethod"
                                        value={shippingMethod}
                                        onChange={(e) => setShippingMethod(e.target.value)}
                                        className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                                    >
                                        <option value="standard">Standard (3-5 business days)</option>
                                        <option value="express">Express (2 business days)</option>
                                        <option value="overnight">Overnight (Next business day)</option>
                                    </select>
                                </div>

                                {shippingError && (
                                    <div className="p-3 bg-red-100 text-red-700 text-sm">
                                        {shippingError}
                                    </div>
                                )}

                                {calculatingShipping && (
                                    <div className="text-sm font-light tracking-wider animate-pulse">
                                        Calculating shipping cost...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary & Payment */}
                        <div className="bg-gray-50 p-6">
                            <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Order Summary</h2>

                            <div className="border-t border-gray-200">
                                {orderItems.map((item) => (
                                    <CheckoutItem key={item.uid} item={item} />
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="font-light">Subtotal</span>
                                    <span className="font-light">${(subTotal / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-light">Shipping {calculatingShipping && '(calculating...)'}</span>
                                    <span className="font-light">
                                        {shippingCost ? `$${shippingCost.toFixed(2)}` : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-light">Taxes (9.75%)</span>
                                    <span className="font-light">${(taxTotal / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg mt-4 pt-4 border-t border-gray-200">
                                    <span className="font-light">Total</span>
                                    <span className="font-light">${(totalAmount / 100).toFixed(2)} USD</span>
                                </div>

                                {shippingDistance !== null && (
                                    <div className="mt-4 text-xs text-gray-500">
                                        <p>Shipping from: Baton Rouge, LA (approx. {shippingDistance} miles)</p>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Payment</h2>

                            <div className="mb-8">
                                {paymentError && (
                                    <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
                                        {paymentError}
                                    </div>
                                )}

                                <PaymentForm
                                    applicationId={envApplicationId}
                                    locationId={envLocationId}
                                    cardTokenizeResponseReceived={handlePayment}
                                    createPaymentRequest={() => ({
                                        countryCode: 'US',
                                        currencyCode: 'USD',
                                        total: {
                                            amount: totalAmount, // totalAmount is already in cents
                                            label: 'Total',
                                        }
                                    })}
                                >
                                    <CreditCard
                                        buttonProps={{
                                            isLoading: loading,
                                            css: {
                                                backgroundColor: '#000',
                                                fontSize: '14px',
                                                fontWeight: '300',
                                                letterSpacing: '0.05em',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#333'
                                                }
                                            }
                                        }}
                                    />
                                </PaymentForm>

                                {loading && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm font-light tracking-wider animate-pulse">Processing payment...</p>
                                    </div>
                                )}

                                <div className="mt-6 text-xs text-gray-500">
                                    <p>By clicking "Pay", you agree to our terms of service and privacy policy.</p>
                                    <p>Shipping will be calculated based on your address and selected shipping method.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}