export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = await params; // This is the product ID from the URL.
    try {
        // Create a URL for the catalog endpoint.
        // We derive the origin from the incoming request.
        const requestUrl = new URL(request.url);
        requestUrl.pathname = '/api/catalog';
        // Fetch your enriched catalog data from your existing endpoint.
        const catalogRes = await fetch(requestUrl.toString());
        const catalogData = await catalogRes.json();

        // Assume your catalog API returns items in the "objects" key.
        const products = catalogData.objects || catalogData;
        const product = products.find(item => item.id === id);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product detail:', error);
        return NextResponse.json(
            { error: 'Error fetching product detail' },
            { status: 500 }
        );
    }
}
