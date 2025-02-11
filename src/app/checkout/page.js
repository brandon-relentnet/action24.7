'use client';

import { useCart } from '@/app/context/CartContext';
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { submitPayment } from '@/app/actions/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ENV_VARS from '@/lib/env';

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID } = ENV_VARS;

    // Calculate the total amount (in cents).
    const totalAmount = cartItems.reduce((sum, item) => {
        const variation = item.itemData?.variations?.[0];
        const priceMoney = variation?.itemVariationData?.priceMoney || variation?.itemVariationData?.defaultUnitCost;
        return sum + (priceMoney ? Number(priceMoney.amount) : 0);
    }, 0);

    const handlePayment = async (token) => {
        setLoading(true);
        try {
            const checkoutData = {
                amount: totalAmount, // in cents
                currency: "USD",
            };
            // Pass token and aggregated checkoutData to your server action.
            const result = await submitPayment(token.token, checkoutData);
            if (result && result.payment) {
                clearCart();
                // Redirect to a confirmation page.
                router.push("/checkout-confirmation");
            } else {
                alert("Payment failed");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Error processing payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Checkout</h1>
            <p>Total: ${(totalAmount / 100).toFixed(2)} USD</p>
            <PaymentForm
                applicationId={SQUARE_APPLICATION_ID}
                locationId={SQUARE_LOCATION_ID}
                cardTokenizeResponseReceived={handlePayment}
            >
                <CreditCard />
            </PaymentForm>
            {loading && <p>Processing payment...</p>}
        </div>
    );
}
