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

export async function submitPayment(sourceId, checkoutData) {
    try {
        

        // Process the payment and attach the created order.
        const paymentResponse = await client.payments.create({
            idempotencyKey: randomUUID(),
            sourceId,
            amountMoney: {
                currency: checkoutData.currency,
                amount: BigInt(parseInt(checkoutData.amount)),
            },
            orderId: checkoutData.orderId,
        });

        return paymentResponse;
    } catch (error) {
        console.error("submitPayment error:", error);
        throw error;
    }
}
