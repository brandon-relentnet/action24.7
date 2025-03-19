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

        const subTotal = response.order.totalMoney;

        // Add the taxes array to the order.
        response.order.taxes = [
            {
            percentage: "9.75",
            scope: "ORDER",
            uid: "STATE-SALES-9.75-PCT",
            name: "State sales tax - 9.75%",
            }
        ];

        // Use the modified order to perform calculations.
        const orderCalculation = await client.orders.calculate({
            order: response.order,
        });

        // Add the subtotal to the final order calculation.
        orderCalculation.order.subTotal = subTotal;

        console.log(orderCalculation);

        // Return the calculated order details.
        return new Response(JSON.stringify(orderCalculation), {
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
