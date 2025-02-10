BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

const client = new SquareClient({
    environment: SquareEnvironment.Production,
    token: process.env.SQUARE_ACCESS_TOKEN,
});

export async function GET() {
    try {
        const response = await client.catalog.list({
            includeRelatedObjects: true,
        });
        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
    }
}