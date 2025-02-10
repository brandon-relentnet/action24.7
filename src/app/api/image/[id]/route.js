export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

const client = new SquareClient({
    environment: SquareEnvironment.Production, // or Sandbox as needed
    token: process.env.SQUARE_ACCESS_TOKEN,
});

export async function GET(request, { params }) {
    const { id } = await params; // The image ID passed in the URL
    try {
        const imageResponse = await client.catalog.object.get({ objectId: id, includeRelatedObjects: true });
        console.log('Image response:', imageResponse);
        // Navigate into the response structure: it should have catalogObject.imageData.url if available
        const imageUrl = imageResponse.object?.imageData?.url;
        if (!imageUrl) {
            return NextResponse.json({ error: 'No image URL found for this object' }, { status: 404 });
        }
        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch image data' }, { status: 500 });
    }
}
