import { SquareClient, SquareEnvironment } from "square";

const token = process.env.APP_ENV === 'production'
    ? process.env.PRODUCTION_SQUARE_ACCESS_TOKEN
    : process.env.SANDBOX_SQUARE_ACCESS_TOKEN;

export const locationId = process.env.APP_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_LOCATION_ID
    : process.env.NEXT_PUBLIC_SANDBOX_SQUARE_LOCATION_ID;

// Initialize the Square client.
export const client = new SquareClient({
    environment:
        process.env.APP_ENV === 'production'
            ? SquareEnvironment.Production
            : SquareEnvironment.Sandbox,
    token: token,
});

