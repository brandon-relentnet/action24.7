// Ensure BigInts can be serialized to JSON.
BigInt.prototype.toJSON = function () {
    return Number(this);
};

export const runtime = 'nodejs';

import { randomUUID } from "crypto";
import { client } from '@/utils/squareInfo';

export async function GET(orderInformation) {
    const orderResponse = await client.orders.calculate({
        order: {
            locationId: "L182TWM8YVZSR",
            lineItems: [
                {
                    quantity: "2",
                    name: "Dog Biscuits - Chicken Flavor",
                    basePriceMoney: {
                        amount: BigInt("1500"),
                        currency: "USD",
                    },
                },
                {
                    quantity: "1",
                    name: "Handmade Sweater - Blue",
                    basePriceMoney: {
                        amount: BigInt("5000"),
                        currency: "USD",
                    },
                    appliedTaxes: [
                        {
                            taxUid: "FAIR-TRADE-5-PCT",
                        },
                    ],
                },
                {
                    quantity: "3",
                    name: "Chewy Rawhide - Beef Flavor",
                    basePriceMoney: {
                        amount: BigInt("1200"),
                        currency: "USD",
                    },
                },
            ],
            taxes: [
                {
                    percentage: "8.5",
                    scope: "ORDER",
                    uid: "STATE-SALES-8.5-PCT",
                    name: "State sales tax - 8.5%",
                },
                {
                    uid: "FAIR-TRADE-5-PCT",
                    name: "Fair Trade Tax - 5%",
                    percentage: "5",
                    scope: "LINE_ITEM",
                },
            ],
        },
    });

    return new Response(JSON.stringify(orderResponse), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
