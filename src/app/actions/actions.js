"use server";

import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";

// Ensure BigInts can be serialized to JSON.
BigInt.prototype.toJSON = function () {
    return Number(this);
};

const token = process.env.APP_ENV === 'production'
    ? process.env.PRODUCTION_SQUARE_ACCESS_TOKEN
    : process.env.SANDBOX_SQUARE_ACCESS_TOKEN;

const locationId = process.env.APP_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_LOCATION_ID
    : process.env.NEXT_PUBLIC_SANDBOX_SQUARE_LOCATION_ID;

// Initialize the Square client.
const client = new SquareClient({
    environment:
        process.env.APP_ENV === 'production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
    token: token,
});

export async function submitPayment(sourceId, checkoutData, cartItems) {
    try {
        // Build order line items from the cart data.
        const lineItems = cartItems.map(item => {
            const variation = item.itemData?.variations?.[0];
            if (!variation || !variation.id) {
                throw new Error('Invalid item variation data');
            }
            return {
                catalogObjectId: variation.id,       // Use the variation's id from your catalog.
                quantity: item.quantity.toString(),    // Square expects quantity as a string.
                itemType: item.type,                   // For example: "ITEM"
            };
        });

        // Create an order with the line items.
        const orderResponse = await client.orders.create({
            idempotencyKey: randomUUID(),
            order: {
                locationId,
                lineItems,
            },
        });

        const orderId = orderResponse.order?.id;
        if (!orderId) {
            throw new Error('Order creation failed');
        }

        // Process the payment and attach the created order.
        const paymentResponse = await client.payments.create({
            idempotencyKey: randomUUID(),
            sourceId,
            amountMoney: {
                currency: checkoutData.currency,
                amount: BigInt(checkoutData.amount), // amount in cents
            },
            orderId, // Attaches the payment to the created order.
        });

        return paymentResponse;
    } catch (error) {
        console.error("submitPayment error:", error);
        throw error;
    }
}
