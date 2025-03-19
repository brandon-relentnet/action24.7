// app/api/orders/[orderId]/route.js
import { client, locationId } from '@/utils/squareInfo';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { orderId } = await params;

    try {
        const response = await client.orders.get({ orderId: orderId, includeRelatedObjects: true });

        const order = response.order;

        // Filter line items to only include those of type 'ITEM'
        const orderLineItems = (order.lineItems || []).filter(item => item.itemType === 'ITEM');

        // Extract catalog object IDs from the line items
        const catalogObjectIds = orderLineItems.map(item => item.catalogObjectId);
        if (!catalogObjectIds.length) {
            return NextResponse.json({ objects: [] });
        }

        // Batch retrieve catalog objects along with their related objects using the catalog object IDs
        const obtainObjectIds = await client.catalog.batchGet({
            objectIds: catalogObjectIds,
            includeRelatedObjects: true,
        });

        // Obtain the Object Ids from the response
        const objectItemData = obtainObjectIds.relatedObjects.map(item => item.itemData) || [];
        const objectIds = obtainObjectIds.relatedObjects.map(item => item.id) || [];

        // Batch retrieve the related objects using the object IDs
        const obtainImageIds = await client.catalog.batchGet({
            objectIds: objectIds,
            includeRelatedObjects: true,
        });
        const imageIds = obtainImageIds.relatedObjects || [];

        const imageMap = imageIds.reduce((map, obj) => {
            if (obj.type === "IMAGE" && obj.imageData && obj.id) {
                map[obj.id] = obj.imageData.url;
            }
            return map;
        }, {});

        const enrichedOrderItems = objectItemData.map(item => {
            const imageIds = item.imageIds || [];
            const imageUrl = imageIds.length ? imageMap[imageIds[0]] || null : null;
            if (imageUrl === null) {
                console.log("Missing image URL for item:", item, "imageId:", imageIds[0]);
            }
            return { ...item, imageUrl };
        });

        console.log("enriched order items ***", enrichedOrderItems);
        return NextResponse.json({
            order: {
                ...response.order,
                lineItems: enrichedOrderItems
            }
        });

        
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}