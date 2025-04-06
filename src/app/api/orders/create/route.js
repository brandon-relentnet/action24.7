// app/api/orders/create/route.js
// Ensure BigInts can be serialized to JSON.
BigInt.prototype.toJSON = function () {
    return Number(this);
};

export const runtime = 'nodejs';
import { randomUUID } from "crypto";
import { client, locationId } from '@/utils/squareInfo';

export async function POST(request) {
    const { cartItems } = await request.json();

    try {
        const lineItems = cartItems.map(item => {
            // Check if we're getting the catalogObjectId directly or need to extract it
            let catalogObjectId;

            if (item.catalogObjectId) {
                // New structure - variation ID is directly provided
                catalogObjectId = item.catalogObjectId;
            } else if (item.itemData?.variations?.[0]?.id) {
                // Old structure - extract from nested variations array
                catalogObjectId = item.itemData.variations[0].id;
            } else {
                throw new Error('Invalid item variation data - no catalogObjectId found');
            }

            return {
                catalogObjectId: catalogObjectId,
                quantity: (item.quantity || 1).toString(),
                itemType: item.type || 'ITEM',
                // Add metadata for the variation name so we can display it in the cart
                metadata: {
                    variationName: item.variationName || '',
                    imageUrl: item.imageUrl || ''
                }
            };
        });

        const orderResponse = await client.orders.create({
            idempotencyKey: randomUUID(),
            order: {
                locationId,
                lineItems,
                taxes: [
                    {
                        percentage: "8.25",
                        scope: "ORDER",
                        uid: "STATE-SALES-8.25-PCT",
                        name: "State sales tax - 8.25%",
                    }
                ]
            },
        });

        return new Response(JSON.stringify(orderResponse), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return new Response(JSON.stringify({
            error: error.message,
            details: error.errors || 'No additional details'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}