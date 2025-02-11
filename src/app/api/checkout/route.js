// File: src/app/api/checkout/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';
import ENV_VARS from '@/lib/env';

const { SQUARE_ENVIRONMENT } = ENV_VARS;
const token = SQUARE_ENVIRONMENT === 'Production'
    ? process.env.PRODUCTION_SQUARE_ACCESS_TOKEN
    : process.env.SANDBOX_SQUARE_ACCESS_TOKEN;

// Initialize the Square client.
const client = new SquareClient({
    environment:
        SQUARE_ENVIRONMENT === 'Production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
    token: token,
});

export async function POST(request) {
    try {
        const { itemId, variationId, name, price, currency, quantity } =
            await request.json();

        // Validate required product details.
        if (!name || !price || !currency || !quantity) {
            return NextResponse.json(
                { error: 'Missing required product details' },
                { status: 400 }
            );
        }

        // Retrieve your Square location ID from your environment variables.
        const locationId = ENV_VARS.SQUARE_LOCATION_ID;
        if (!locationId) {
            return NextResponse.json(
                { error: 'Square location ID is not configured' },
                { status: 500 }
            );
        }

        // Generate an idempotency key to avoid duplicate orders.
        const idempotencyKey = crypto.randomUUID();

        // Construct the order request.
        const orderRequest = {
            order: {
                locationId,
                lineItems: [
                    {
                        name,
                        quantity: quantity.toString(),
                        basePriceMoney: {
                            amount: price, // Price in cents.
                            currency,
                        },
                    },
                ],
            },
            idempotencyKey,
        };

        // Create the checkout session.
        // Use client.checkout (instead of client.checkoutApi) if checkoutApi is undefined.
        const checkoutResponse = await client.checkout.createCheckout(
            locationId,
            orderRequest
        );

        // Extract the checkout URL from the response.
        const checkoutUrl = checkoutResponse.result?.checkout?.checkoutPageUrl;
        if (!checkoutUrl) {
            return NextResponse.json(
                { error: 'No checkout URL returned from Square' },
                { status: 500 }
            );
        }

        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout" },
            { status: 500 }
        );
    }
}
