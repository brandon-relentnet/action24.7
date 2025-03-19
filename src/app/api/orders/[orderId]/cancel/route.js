// app/api/orders/[orderId]/cancel/route.js
import { client } from '@/utils/squareInfo';

export async function POST(request, { params }) {
    const { orderId } = await params;

    try {
        // Depending on your requirements, you might cancel or delete the order
        const response = await client.orders.update({
            orderId,
            order: {
                state: "CANCELED"
            }
        });

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}