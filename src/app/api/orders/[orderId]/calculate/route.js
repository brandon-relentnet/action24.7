// app/api/orders/[orderId]/calculate/route.js
BigInt.prototype.toJSON = function () {
    return Number(this);
};

import { client } from '@/utils/squareInfo';

export async function GET(request, { params }) {
    const { orderId } = await params;

    if (!orderId) {
        return new Response("Missing orderId", { status: 400 });
    }

    try {
        // Retrieve the existing order using the orderId.
        const response = await client.orders.get({ orderId: orderId });

        if (!response.order.lineItems || response.order.lineItems.length === 0) {
            const emptyCalculation = {
                order: {
                    subTotal: response.order.totalMoney,
                    totalMoney: response.order.totalMoney,
                    taxes: [],
                },
            };
            return new Response(JSON.stringify(emptyCalculation), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        const subTotal = {
            amount: (response.order.totalMoney.amount - response.order.totalTaxMoney.amount),
            currency: response.order.totalMoney.currency,
        };

        response.order.subTotal = subTotal;

        // Return the calculated order details.
        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        // Handle errors (e.g., order not found, network issues)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
