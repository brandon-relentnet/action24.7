// File: src/app/api/checkout/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import crypto from 'crypto';
import ENV_VARS from '@/lib/env'; // Assuming you have a module for your env vars

// Initialize the Square client.
const client = new SquareClient({
    environment:
        ENV_VARS.SQUARE_ENVIRONMENT === 'Production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
    token: ENV_VARS.SQUARE_ACCESS_TOKEN,
});

export async function POST(request) {
    try {
        // Parse the incoming JSON payload.
        const { itemId, variationId, name, price, currency, quantity } =
            await request.json();

        // Basic input validation.
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
        // Here we only pass a simple line item with a name, quantity, and price.
        // In a production application you might include additional fields such as variationId,
        // modifiers, taxes, etc.
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

        // Create the checkout session using the Square Checkout API.
        const checkoutResponse = await client.checkoutApi.createCheckout(
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

        // Return the checkout URL to the client.
        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout" },
            { status: 500 }
        );
    }
}
