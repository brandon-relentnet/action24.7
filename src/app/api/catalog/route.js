// Ensure BigInts are serialized as strings.
BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';
import ENV_VARS from '@/lib/env';

const client = new SquareClient({
    environment: ENV_VARS.SQUARE_ENVIRONMENT === 'Production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
    token: ENV_VARS.SQUARE_ACCESS_TOKEN,
});

export async function GET() {
    try {
        // Fetch the catalog with related objects enabled.
        const catalogResponse = await client.catalog.list({
            includeRelatedObjects: true,
        });
        const catalogItems = catalogResponse.data || [];

        // Extract all object IDs from the catalog items.
        const objectIds = catalogItems.map(item => item.id);
        if (!objectIds.length) {
            return NextResponse.json({ objects: [] });
        }

        // Batch retrieve catalog objects along with their related objects.
        const batchResponse = await client.catalog.batchGet({
            objectIds,
            includeRelatedObjects: true,
        });
        // Access the objects and related objects from the batch response.
        const relatedObjects = batchResponse.relatedObjects || [];

        // Build a mapping from image object ID to its URL.
        const imageMap = relatedObjects.reduce((map, obj) => {
            // Use the camelCase properties (imageData) as returned by the SDK.
            if (obj.type === "IMAGE" && obj.imageData && obj.id) {
                map[obj.id] = obj.imageData.url;
            }
            return map;
        }, {});

        // Enrich each catalog item with its first image URL (if any).
        const enrichedItems = catalogItems.map(item => {
            const imageIds = item.itemData?.imageIds || [];
            const imageUrl = imageIds.length ? imageMap[imageIds[0]] || null : null;
            return { ...item, imageUrl };
        });

        return NextResponse.json({ objects: enrichedItems });
    } catch (error) {
        console.error("Error fetching enriched catalog:", error);
        return NextResponse.json(
            { error: 'Failed to fetch enriched catalog' },
            { status: 500 }
        );
    }
}
