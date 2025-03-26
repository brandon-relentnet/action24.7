// app/api/orders/[orderId]/update/route.js
import { randomUUID } from "crypto";
import { client, locationId } from '@/utils/squareInfo';

export async function POST(request, { params }) {
    const { orderId } = await params;
    const body = await request.json();
    const { action, itemData, lineItemId, quantity, versionId } = body;

    try {
        let response;

        // Log the client structure to understand its properties
        console.log("Client structure keys:", Object.keys(client));

        switch (action) {
            case 'add_item':
                // Add a new item to the order
                const variation = itemData.itemData?.variations?.[0];
                if (!variation || !variation.id) {
                    throw new Error('Invalid item variation data');
                }

                response = await client.orders.update({
                    orderId,
                    idempotencyKey: randomUUID(),
                    order: {
                        locationId,
                        lineItems: [
                            {
                                catalogObjectId: variation.id,
                                quantity: (itemData.quantity || 1).toString(),
                                itemType: itemData.type || 'ITEM',
                            }
                        ],
                        version: versionId
                    }
                });
                break;

            case 'update_quantity':
                // Update quantity of an existing line item
                response = await client.orders.update({
                    orderId,
                    idempotencyKey: randomUUID(),
                    order: {
                        locationId,
                        lineItems: [
                            {
                                uid: lineItemId,
                                quantity: quantity.toString()
                            }
                        ],
                        version: versionId
                    }
                });
                break;

            case 'remove_item':
                // Remove an item from the order
                response = await client.orders.update({
                    orderId,
                    idempotencyKey: randomUUID(),
                    fieldsToClear: [`line_items[${lineItemId}]`],
                    order: {
                        locationId,
                        version: versionId
                    }
                });
                break;

            case 'clear_order':
                // Clear the entire order
                response = await client.orders.update({
                    orderId,
                    idempotencyKey: randomUUID(),
                    fieldsToClear: ['line_items'],
                    order: {
                        locationId,
                        version: versionId
                    }
                });
                break;

            case 'add_shipping':
                // Extract shipping details from the request
                const { basePriceMoney } = itemData;

                // Use the same client structure as your other working actions
                response = await client.orders.update({
                    orderId,
                    idempotencyKey: randomUUID(),
                    order: {
                        locationId,
                        lineItems: [
                            {
                                basePriceMoney: {
                                    amount: BigInt(basePriceMoney.amount),
                                    currency: basePriceMoney.currency || 'USD'
                                },
                                quantity: "1",
                                itemType: "CUSTOM_AMOUNT"
                            }
                        ],
                        version: versionId
                    }
                });
                break;

            default:
                throw new Error('Invalid action');
        }

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Order update error:', error);
        return new Response(JSON.stringify({
            error: error.message,
            details: error.errors || 'No additional details'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}