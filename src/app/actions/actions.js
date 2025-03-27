"use server";
import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";

// Ensure BigInts can be serialized to JSON.
BigInt.prototype.toJSON = function () {
    return Number(this);
};

const token = process.env.APP_ENV === 'production'
    ? process.env.PRODUCTION_SQUARE_ACCESS_TOKEN
    : process.env.SANDBOX_SQUARE_ACCESS_TOKEN;

const locationId = process.env.APP_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_LOCATION_ID
    : process.env.NEXT_PUBLIC_SANDBOX_SQUARE_LOCATION_ID;

// Initialize the Square client.
const client = new SquareClient({
    environment:
        process.env.APP_ENV === 'production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
    token: token,
});

export async function submitPayment(sourceId, checkoutData) {
    try {
        const { orderId, amount, currency, shippingDetails, customerDetails } = checkoutData;

        // First, get the current order to retrieve its version
        const orderResponse = await client.orders.get({
            orderId: orderId
        });

        const currentVersion = orderResponse.order.version;

        // Add shipping to the order if shipping details are provided
        if (shippingDetails && shippingDetails.cost) {
            // Format shipping method name for better readability
            const methodName = shippingDetails.method.charAt(0).toUpperCase() + shippingDetails.method.slice(1);

            // Add shipping as a line item to the order
            try {
                const shippingResponse = await client.orders.update({
                    orderId,
                    idempotencyKey: randomUUID(),
                    order: {
                        locationId,
                        lineItems: [
                            {
                                name: `${methodName} Shipping`,
                                basePriceMoney: {
                                    amount: BigInt(Math.round(shippingDetails.cost * 100)),
                                    currency: currency
                                },
                                quantity: "1",
                                itemType: "ITEM"
                            }
                        ],
                        version: currentVersion,
                        fulfillments: [
                            {
                                type: "SHIPMENT",
                                shipmentDetails: {
                                    recipient: {
                                        displayName: customerDetails ? `${customerDetails.firstName} ${customerDetails.lastName}` : "Customer",
                                        emailAddress: customerDetails.email,
                                        address: {
                                            addressLine1: customerDetails.address1,
                                            postalCode: customerDetails.zipCode,
                                            locality: customerDetails.city,
                                            country: customerDetails.country,
                                            firstName: customerDetails.firstName,
                                            lastName: customerDetails.lastName,
                                            administrativeDistrictLevel1: customerDetails.state,
                                        },
                                    },
                                    shippingType: methodName,
                                },
                                state: "PROPOSED",
                            },
                        ]
                    }
                });

                console.log("Shipping added successfully:", shippingResponse);
            } catch (shippingError) {
                console.error("Error adding shipping to order:", shippingError);
                // Continue with payment even if shipping line item fails
            }
        }

        // Process the payment and attach it to the order
        const paymentResponse = await client.payments.create({
            idempotencyKey: randomUUID(),
            sourceId,
            amountMoney: {
                currency: currency,
                amount: BigInt(parseInt(amount)),
            },
            orderId: orderId,
            // Add customer information if available
            buyerEmailAddress: customerDetails?.email,
            // Add note with shipping details
            note: shippingDetails ?
                `${shippingDetails.method.toUpperCase()} shipping` :
                undefined
        });

        // Format the response to ensure a consistent structure
        // This structure will match what the front-end expects
        return {
            success: true,
            result: {
                payment: paymentResponse.payment
            },
            // Also include the raw response for debugging
            rawResponse: paymentResponse
        };
    } catch (error) {
        console.error("submitPayment error:", error);
        // Return a properly structured error response
        return {
            success: false,
            error: error.message || "Payment processing failed",
            details: error.errors || []
        };
    }
}