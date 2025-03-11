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
        const response = await client.payments.create({
            idempotencyKey: randomUUID(),
            sourceId,
            amountMoney: {
                currency: checkoutData.currency,
                amount: BigInt(checkoutData.amount),
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}
