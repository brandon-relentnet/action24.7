// app/api/orders/[orderId]/route.js
import { client, locationId } from '@/utils/squareInfo';

export async function GET(request, { params }) {
    const { orderId } = await params; 
    
    console.log('Retrieving order for orderId:', orderId);
    try {
        const response = await client.orders.get({orderId : orderId});

        // You need to stringify the response object
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