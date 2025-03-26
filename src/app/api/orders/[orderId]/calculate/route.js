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

        const subTotal = response.order.totalMoney;

        // Extract the necessary data from line items.
        const newLineItems = response.order.lineItems.map((lineItem) => {
            return {
                catalogObjectId: lineItem.catalogObjectId,
                quantity: lineItem.quantity,
                itemType: lineItem.itemType,
            };
        });

        const orderToCalculate = {
            locationId: response.order.locationId,
            lineItems: newLineItems,
        };

        // Add the taxes array to the order.
        orderToCalculate.taxes = [
            {
            percentage: "9.75",
            scope: "ORDER",
            uid: "STATE-SALES-9.75-PCT",
            name: "State sales tax - 9.75%",
            }
        ];

        // Use the modified order to perform calculations.
        const orderCalculation = await client.orders.calculate({
            order: orderToCalculate,
        });

        // Add the subtotal to the final order calculation.
        orderCalculation.order.subTotal = subTotal;

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
