// app/api/orders/[orderId]/route.js
import { client } from '@/utils/squareInfo';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { orderId } = await params;

    try {
        // Step 1: Get the order with line items
        const response = await client.orders.get({ orderId: orderId, includeRelatedObjects: true });
        const order = response.order;

        // Filter line items to only include those of type 'ITEM'
        const orderLineItems = (order.lineItems || []).filter(item => item.itemType === 'ITEM');

        // Extract catalog object IDs from the line items
        const catalogObjectIds = orderLineItems.map(item => item.catalogObjectId);
        if (!catalogObjectIds.length) {
            return NextResponse.json({ order });
        }

        // Step 2: First catalog request to get catalog items and their variations
        const catalogResponse = await client.catalog.batchGet({
            objectIds: catalogObjectIds,
            includeRelatedObjects: true,
        });

        // Step 3: Extract all potential image IDs from both objects and related objects
        const allImageIds = new Set();
        const catalogItemMap = {};

        // Process main objects (typically variations)
        if (catalogResponse.objects) {
            catalogResponse.objects.forEach(obj => {
                // Store by ID for later lookup
                catalogItemMap[obj.id] = obj;

                // Find image IDs in item variations
                if (obj.type === 'ITEM_VARIATION' && obj.itemVariationData) {
                    // Store parent item ID for lookup
                    if (obj.itemVariationData.itemId) {
                        catalogItemMap[obj.id] = {
                            ...catalogItemMap[obj.id],
                            parentItemId: obj.itemVariationData.itemId
                        };
                    }
                }
            });
        }

        // Process related objects (typically parent items)
        if (catalogResponse.relatedObjects) {
            catalogResponse.relatedObjects.forEach(obj => {
                // Store by ID for later lookup
                catalogItemMap[obj.id] = obj;

                // Find image IDs in item data
                if (obj.type === 'ITEM' && obj.itemData && obj.itemData.imageIds) {
                    obj.itemData.imageIds.forEach(imageId => {
                        allImageIds.add(imageId);
                    });

                    // Map parent items to their variations
                    if (obj.itemData.variations) {
                        obj.itemData.variations.forEach(variation => {
                            if (variation.id) {
                                // Link variation to parent
                                catalogItemMap[variation.id] = {
                                    ...catalogItemMap[variation.id],
                                    parentItemId: obj.id,
                                    parentItem: obj
                                };
                            }
                        });
                    }
                }
            });
        }

        const imageIdsArray = [...allImageIds];

        // Step 4: If we have image IDs, get the image objects
        let imageMap = {};
        if (imageIdsArray.length > 0) {
            const imageResponse = await client.catalog.batchGet({
                objectIds: imageIdsArray,
            });

            //console.log(`Found ${imageResponse.objects ? imageResponse.objects.length : 0} image objects`);

            // Create map of image IDs to image URLs
            if (imageResponse.objects) {
                imageResponse.objects.forEach(obj => {
                    if (obj.type === 'IMAGE' && obj.imageData && obj.imageData.url) {
                        imageMap[obj.id] = obj.imageData.url;
                    }
                });
            }
        }

        // Step 5: Enhance line items with images and detailed info
        const enrichedLineItems = orderLineItems.map(item => {
            const enrichedItem = { ...item };

            // Try to find parent item through the catalog item map
            const catalogItem = catalogItemMap[item.catalogObjectId];
            //console.log(`Processing item: ${item.name} with catalogObjectId: ${item.catalogObjectId}`);

            if (catalogItem) {
                //console.log(`Found catalog item with type: ${catalogItem.type}`);

                // If it's a variation, get the parent item
                if (catalogItem.type === 'ITEM_VARIATION' && catalogItem.parentItemId) {
                    const parentItem = catalogItemMap[catalogItem.parentItemId];
                    //console.log(`Found parent item: ${parentItem ? 'Yes' : 'No'}`);

                    if (parentItem && parentItem.itemData && parentItem.itemData.imageIds) {
                        // Get the first image ID from the parent item
                        const firstImageId = parentItem.itemData.imageIds[0];
                        //console.log(`Found image ID: ${firstImageId} for item: ${item.name}`);

                        if (firstImageId && imageMap[firstImageId]) {
                            enrichedItem.imageUrl = imageMap[firstImageId];
                            //console.log(`Added image URL: ${enrichedItem.imageUrl} to item: ${item.name}`);
                        }

                        // Add additional data from parent item
                        if (parentItem.itemData) {
                            enrichedItem.description = parentItem.itemData.description;
                            enrichedItem.id = parentItem.id;

                        }
                    } else if (catalogItem.parentItem && catalogItem.parentItem.itemData && catalogItem.parentItem.itemData.imageIds) {
                        // Alternative: try to get images from the parentItem object directly
                        const firstImageId = catalogItem.parentItem.itemData.imageIds[0];
                        if (firstImageId && imageMap[firstImageId]) {
                            enrichedItem.imageUrl = imageMap[firstImageId];
                        }
                    }
                }
                // If it's already the parent item
                else if (catalogItem.type === 'ITEM' && catalogItem.itemData && catalogItem.itemData.imageIds) {
                    const firstImageId = catalogItem.itemData.imageIds[0];
                    if (firstImageId && imageMap[firstImageId]) {
                        enrichedItem.imageUrl = imageMap[firstImageId];
                        //console.log(`Added image URL: ${enrichedItem.imageUrl} to item: ${item.name}`);
                    }

                    // Add additional data
                    if (catalogItem.itemData) {
                        enrichedItem.description = catalogItem.itemData.description;
                        enrichedItem.id = catalogItem.id;
                    }
                }
            } else {
                console.log(`No catalog item found for ID: ${item.catalogObjectId}`);
            }

            return enrichedItem;
        });

        // Return the order with the enriched line items
        return NextResponse.json({
            order: {
                ...order,
                lineItems: enrichedLineItems
            }
        });

    } catch (error) {
        console.error('Error retrieving order:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}