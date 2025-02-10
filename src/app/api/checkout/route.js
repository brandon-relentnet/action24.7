export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';

import ENV_VARS from '@/lib/env';

const client = new SquareClient({
    environment: ENV_VARS.SQUARE_ENVIRONMENT === 'Production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
    token: ENV_VARS.SQUARE_ACCESS_TOKEN,
});

export async function POST(request) {
    try {
        const { itemId, variationId, name, price, currency, quantity } = await request.json();
        // Use your Square location ID from your environment variables.
        const locationId = process.env.SQUARE_LOCATION_ID;
        // Generate a unique idempotency key.
        const idempotencyKey = crypto.randomUUID();

        // Construct an order request for this product.
        const orderRequest = {
            order: {
                locationId,
                lineItems: [
                    {
                        name,
                        quantity: quantity.toString(),
                        basePriceMoney: {
                            amount: price, // in cents
                            currency,
                        },
                    },
                ],
            },
            idempotencyKey,
        };

        // Create a checkout session.
        const checkoutResponse = await client.checkoutApi.createCheckout(locationId, orderRequest);
        // Extract the checkout URL.
        const checkoutUrl = checkoutResponse.result?.checkout?.checkoutPageUrl;
        if (!checkoutUrl) {
            return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
        }
        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }
}
