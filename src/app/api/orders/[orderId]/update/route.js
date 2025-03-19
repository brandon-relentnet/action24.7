// app/api/orders/[orderId]/update/route.js
import { randomUUID } from "crypto";
import { client, locationId } from '@/utils/squareInfo';
import { version } from "os";

export async function POST(request, { params }) {
    const { orderId } = await params;
    const { action, itemData, lineItemId, quantity, versionId } = await request.json();

    try {
        let response;

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
                        ]
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
                        ]
                    }
                });
                break;

            case 'remove_item':
                // First get the current order to see all line items
                const currentOrder = await client.orders.get(orderId);

                // Filter out the item to remove
                const updatedLineItems = (currentOrder.order.lineItems || [])
                    .filter(item => item.uid !== lineItemId)
                    .map(item => ({
                        uid: item.uid,
                        quantity: item.quantity
                    }));

                console.log('updatedLineItems', updatedLineItems);

                // Update the order with only the items we want to keep
                response = await client.orders.update({
                    orderId,
                    idempotencyKey: randomUUID(),
                    order: {
                        locationId,
                        lineItems: updatedLineItems,
                        version: currentOrder.order.version
                    }
                });
                break;

            case 'clear_order':
                // Clear the entire order (this is a custom action, not standard in Square)
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

            default:
                throw new Error('Invalid action');
        }

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