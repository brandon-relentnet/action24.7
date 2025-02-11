"use server";
import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";

// Ensure BigInts can be serialized to JSON.
BigInt.prototype.toJSON = function () {
    return Number(this);
};

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

export async function submitPayment(sourceId) {
    try {
        const { result } = await client.payments.create({
            idempotencyKey: randomUUID(),
            sourceId,
            amountMoney: {
                currency: "USD",
                amount: BigInt(100),
            },
        });
        return result;
    } catch (error) {
        console.log(error);
    }
}
