'use client';

import { useSquareOrder } from '@/app/context/SquareOrderContext';
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { submitPayment } from '@/app/actions/actions';
import { useState, useEffect, useMemo, useCallback } from 'react';
import CheckoutItem from '@/components/CheckoutItem';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Environment configuration
const {
    LOCATION_ID: envLocationId,
    APPLICATION_ID: envApplicationId
} = (() => {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    return {
        LOCATION_ID: isProd
            ? process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_LOCATION_ID
            : process.env.NEXT_PUBLIC_SANDBOX_SQUARE_LOCATION_ID,
        APPLICATION_ID: isProd
            ? process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_APPLICATION_ID
            : process.env.NEXT_PUBLIC_SANDBOX_SQUARE_APPLICATION_ID
    };
})();

// Shipping rate constants
const SHIPPING_RATES = {
    standard: {
        baseRate: 5.99,
        weightRate: 0.75,
        distanceRate: 0.01,
    },
    express: {
        baseRate: 9.99,
        weightRate: 1.25,
        distanceRate: 0.03,
    },
    overnight: {
        baseRate: 19.99,
        weightRate: 2,
        distanceRate: 0.05,
    }
};

// Utility for rounding tax to nearest cent
function computeTaxCents(baseCents, taxRate) {
    return Math.round(baseCents * taxRate);
}

// Required field marker component
const RequiredMark = () => <span className="text-red-500 ml-1">*</span>;

// Customer Information Form Component
const CustomerInformationForm = ({ formData, handleInputChange }) => (
    <div>
        <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Customer Information</h2>
        <p className="text-sm text-gray-500 mb-4">Fields marked with <span className="text-red-500">*</span> are required</p>

        <div className="space-y-4 mb-8">
            <div>
                <label htmlFor="email" className="block text-sm uppercase tracking-wider mb-2">
                    Email<RequiredMark />
                </label>
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
                    <label htmlFor="firstName" className="block text-sm uppercase tracking-wider mb-2">
                        First Name<RequiredMark />
                    </label>
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
                    <label htmlFor="lastName" className="block text-sm uppercase tracking-wider mb-2">
                        Last Name<RequiredMark />
                    </label>
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
    </div>
);

// Shipping Address Form Component
const ShippingAddressForm = ({ formData, handleInputChange }) => (
    <div>
        <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Shipping Address</h2>

        <div className="space-y-4">
            <div>
                <label htmlFor="address1" className="block text-sm uppercase tracking-wider mb-2">
                    Address 1<RequiredMark />
                </label>
                <input
                    type="text"
                    id="address1"
                    name="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                    required
                />
            </div>

            <div>
                <label htmlFor="address2" className="block text-sm uppercase tracking-wider mb-2">
                    Address 2
                </label>
                <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                />
            </div>

            <div>
                <label htmlFor="city" className="block text-sm uppercase tracking-wider mb-2">
                    City<RequiredMark />
                </label>
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
                    <label htmlFor="state" className="block text-sm uppercase tracking-wider mb-2">
                        State<RequiredMark />
                    </label>
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
                    <label htmlFor="zipCode" className="block text-sm uppercase tracking-wider mb-2">
                        Zip Code<RequiredMark />
                    </label>
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
                <label htmlFor="country" className="block text-sm uppercase tracking-wider mb-2">
                    Country<RequiredMark />
                </label>
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
        </div>
    </div>
);

// Order Summary Component
const OrderSummary = ({
    orderItems,
    subTotalCents,
    shippingCostCents,
    taxTotalCents,
    totalAmountCents,
    calculatingShipping,
    shippingDistance
}) => (
    <>
        <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Order Summary</h2>

        <div className="border-t border-gray-200">
            {orderItems.map((item) => (
                <CheckoutItem key={item.uid} item={item} />
            ))}
        </div>

        <div className="border-t border-gray-200 pt-4 mb-8">
            <div className="flex justify-between mb-2">
                <span className="font-light">Subtotal</span>
                <span className="font-light">
                    ${(subTotalCents / 100).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between mb-2">
                <span className="font-light">Shipping {calculatingShipping && '(calculating...)'}</span>
                <span className="font-light">
                    {shippingCostCents
                        ? `$${(shippingCostCents / 100).toFixed(2)}`
                        : 'TBD'
                    }
                </span>
            </div>
            <div className="flex justify-between mb-2">
                <span className="font-light">Taxes (9.75%)</span>
                <span className="font-light">
                    ${(taxTotalCents / 100).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between text-lg mt-4 pt-4 border-t border-gray-200">
                <span className="font-light">Total</span>
                <span className="font-light">
                    ${(totalAmountCents / 100).toFixed(2)} USD
                </span>
            </div>

            {shippingDistance !== null && (
                <div className="mt-4 text-xs text-gray-500">
                    <p>Shipping from: Baton Rouge, LA (approx. {shippingDistance} miles)</p>
                </div>
            )}
        </div>
    </>
);

// Shipping Method Selector Component
const ShippingMethodSelector = ({
    shippingMethod,
    setShippingMethod,
    shippingError,
    calculatingShipping
}) => (
    <>
        <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Shipping</h2>

        <div className="mb-8">
            <div>
                <label htmlFor="shippingMethod" className="block text-sm uppercase tracking-wider mb-2">Shipping Method</label>
                <select
                    id="shippingMethod"
                    name="shippingMethod"
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="w-full p-3 border border-gray-200 focus:outline-none focus:border-black"
                >
                    <option value="standard">Standard (4-7 business days)</option>
                    <option value="express">Express (2-3 business days)</option>
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
    </>
);

// Payment Section Component
const PaymentSection = ({
    isFormValid,
    paymentError,
    loading,
    handlePayment,
    totalAmountCents
}) => (
    <>
        <h2 className="text-xl font-light tracking-wide mb-6 uppercase">Payment</h2>

        <div className="mb-8">
            {paymentError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
                    {paymentError}
                </div>
            )}

            {!isFormValid ? (
                <div className="relative inset-0 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="bg-black/80 text-white p-4 rounded text-center max-w-xs">
                        <p className="font-light tracking-wider">
                            Please complete all required fields to proceed with payment
                        </p>
                    </div>
                </div>
            ) : (
                <PaymentForm
                    applicationId={envApplicationId}
                    locationId={envLocationId}
                    cardTokenizeResponseReceived={handlePayment}
                    createPaymentRequest={() => ({
                        countryCode: 'US',
                        currencyCode: 'USD',
                        total: {
                            amount: totalAmountCents,
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
            )}

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
    </>
);

// Empty Cart Component
const EmptyCart = () => (
    <div className="text-center py-12">
        <p className="text-gray-600 mb-8">Your shopping bag is empty.</p>
        <Link
            href="/collection"
            className="inline-block px-8 py-3 border border-black bg-black text-white uppercase tracking-wider text-sm font-light transition-colors hover:bg-white hover:text-black"
        >
            Continue Shopping
        </Link>
    </div>
);

// Main Checkout Component
export default function CheckoutPage() {
    const { orderId, orderItems, orderCalculation } = useSquareOrder();
    const router = useRouter();

    // States with default values
    const [loading, setLoading] = useState(false);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingDistance, setShippingDistance] = useState(null);
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [shippingError, setShippingError] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [shippingData, setShippingData] = useState(null);

    // Form state with default values
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    });

    // Get order data
    const subTotalCents = orderCalculation?.order?.subTotal?.amount || 0;
    const currency = orderCalculation?.order?.subTotal?.currency || 'USD';

    // Memoized calculations
    const shippingCostCents = useMemo(() => {
        return Math.round(shippingCost * 100);
    }, [shippingCost]);

    const taxTotalCents = useMemo(() => {
        const TAX_RATE = 0.0975; // 9.75%
        return computeTaxCents(subTotalCents + shippingCostCents, TAX_RATE);
    }, [subTotalCents, shippingCostCents]);

    const totalAmountCents = useMemo(() => {
        return subTotalCents + shippingCostCents + taxTotalCents;
    }, [subTotalCents, shippingCostCents, taxTotalCents]);

    // Memoized form validation check
    const isFormValid = useMemo(() => {
        const { email, firstName, lastName, address1, city, state, zipCode } = formData;
        return email && firstName && lastName && address1 && city && state && zipCode &&
            shippingCost > 0 && !calculatingShipping;
    }, [formData, shippingCost, calculatingShipping]);

    // Input change handler with useCallback to prevent unnecessary re-renders
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }, []);

    // Fetch shipping data when address changes
    useEffect(() => {
        const { city, state, zipCode, country } = formData;

        // Only fetch if we have complete address
        if (city && state && zipCode) {
            fetchShippingData();
        }
    }, [formData.city, formData.state, formData.zipCode, formData.country]);

    // Update shipping cost when method changes
    useEffect(() => {
        if (shippingData) {
            calculateLocalShippingCost();
        }
    }, [shippingMethod, shippingData]);

    // Shipping data fetching function
    const fetchShippingData = async () => {
        const { city, state, zipCode, country } = formData;

        if (!city || !state || !zipCode) return;

        setCalculatingShipping(true);
        setShippingError('');

        try {
            const response = await fetch('/api/shipping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    city,
                    state,
                    zipCode,
                    country,
                    shippingMethod: 'standard',
                    quantity: orderItems.length || 1
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to calculate shipping');
            }

            setShippingData({
                distance: data.distance,
                quantity: orderItems.length || 1
            });

            setShippingDistance(data.distance);
            setShippingCost(data.shippingCost);
        } catch (error) {
            console.error('Error calculating shipping:', error);
            setShippingError(error.message || 'Error calculating shipping cost');
        } finally {
            setCalculatingShipping(false);
        }
    };

    // Calculate shipping cost locally based on method
    const calculateLocalShippingCost = useCallback(() => {
        if (!shippingData) return;

        const { distance, quantity } = shippingData;
        const rate = SHIPPING_RATES[shippingMethod];
        const totalWeight = 1 * quantity;

        const cost = rate.baseRate +
            (totalWeight * rate.weightRate) +
            (distance * rate.distanceRate);

        setShippingCost(parseFloat(cost.toFixed(2)));
    }, [shippingData, shippingMethod]);

    // Payment handling function
    const handlePayment = useCallback(async (token) => {
        if (!isFormValid) {
            setPaymentError('Please complete all required fields and ensure shipping is calculated.');
            return;
        }

        setLoading(true);
        setPaymentError('');

        try {
            const checkoutData = {
                orderId,
                amount: totalAmountCents,
                currency,
                customerDetails: formData,
                shippingDetails: {
                    method: shippingMethod,
                    cost: shippingCost,
                    distance: shippingDistance
                }
            };

            const result = await submitPayment(token.token, checkoutData);

            // Check for payment success
            const isPaymentSuccessful =
                (result?.result?.payment) ||
                (result?.payment) ||
                (result?.id && result?.status);

            if (isPaymentSuccessful) {
                // Store order details in localStorage
                localStorage.setItem('lastOrderDetails', JSON.stringify({
                    orderId,
                    orderItems,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerEmail: formData.email,
                    shippingAddress: `${formData.address1}, ${formData.address2}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`,
                    totalAmountCents,
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
    }, [
        isFormValid, orderId, totalAmountCents, currency, formData,
        shippingMethod, shippingCost, shippingDistance, orderItems, router
    ]);

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light tracking-wider uppercase mb-12 text-center">Checkout</h1>

                {orderItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column - Customer Information */}
                        <div>
                            <CustomerInformationForm
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />
                            <ShippingAddressForm
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />
                        </div>

                        {/* Right Column - Order Summary & Payment */}
                        <div className="bg-gray-50 p-6">
                            <OrderSummary
                                orderItems={orderItems}
                                subTotalCents={subTotalCents}
                                shippingCostCents={shippingCostCents}
                                taxTotalCents={taxTotalCents}
                                totalAmountCents={totalAmountCents}
                                calculatingShipping={calculatingShipping}
                                shippingDistance={shippingDistance}
                            />
                            <ShippingMethodSelector
                                shippingMethod={shippingMethod}
                                setShippingMethod={setShippingMethod}
                                shippingError={shippingError}
                                calculatingShipping={calculatingShipping}
                            />
                            <PaymentSection
                                isFormValid={isFormValid}
                                paymentError={paymentError}
                                loading={loading}
                                handlePayment={handlePayment}
                                totalAmountCents={totalAmountCents}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}