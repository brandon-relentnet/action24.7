// File: src/app/api/catalog-full/route.js
BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

const client = new SquareClient({
    environment: SquareEnvironment.Production, // or Sandbox if needed
    token: process.env.SQUARE_ACCESS_TOKEN,
});

export async function GET() {
    try {
        // Fetch the catalog with related objects enabled.
        const catalogResponse = await client.catalog.list({
            includeRelatedObjects: true,
        });
        // The actual catalog items are in catalogResponse.result.objects.
        const catalogItems = (catalogResponse.data) || [];
        // Collect all object IDs from catalog items.
        const objectIds = catalogItems.map(item => item.id);

        // Use a batch call to retrieve full details along with related objects.
        const batchResponse = await client.catalog.batchGet({
            objectIds: objectIds,
            includeRelatedObjects: true,
        });
        const batchObjects = (batchResponse.objects) || [];
        const relatedObjects = (batchResponse.relatedObjects) || [];

        //console.log("Batch Objects:", batchObjects);
        //console.log("Related Objects:", relatedObjects);

        // Build a mapping from image object ID to its URL.
        // Note: Use snake_case: the image objects have an "image_data" property.
        const imageMap = {};
        relatedObjects.forEach(obj => {
            if (obj.type === "IMAGE" && obj.imageData && obj.id) {
                imageMap[obj.id] = obj.imageData.url;
            }
        });
        //console.log("Image Map:", imageMap);

        // Enrich each catalog item with its first image URL.
        // Note: Catalog items contain their image IDs in "item_data.image_ids"
        console.log("Catalog Items:", catalogItems);
        const enrichedItems = catalogItems.map(item => {
            const imageIds = item.itemData ? item.itemData.imageIds : [];
            const imageUrl = (imageIds && imageIds.length > 0) ? imageMap[imageIds[0]] || null : null;
            return { ...item, imageUrl: imageUrl };
        });

        return NextResponse.json({ objects: enrichedItems });
    } catch (error) {
        console.error("Error fetching enriched catalog:", error);
        return NextResponse.json({ error: 'Failed to fetch enriched catalog' }, { status: 500 });
    }
}
