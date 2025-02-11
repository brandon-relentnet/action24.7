// lib/env.js

// Determine the environment (defaults to "sandbox")
const env = (process.env.NEXT_PUBLIC_APP_ENV || 'sandbox').toLowerCase();

const CONFIG = {
    sandbox: {
        SQUARE_ENVIRONMENT: process.env.NEXT_PUBLIC_SANDBOX_SQUARE_ENVIRONMENT,
        SQUARE_LOCATION_ID: process.env.NEXT_PUBLIC_SANDBOX_SQUARE_LOCATION_ID,
        SQUARE_APPLICATION_ID: process.env.NEXT_PUBLIC_SANDBOX_SQUARE_APPLICATION_ID,
        // Note: Sensitive tokens should remain server-side!
        // SQUARE_ACCESS_TOKEN: process.env.SANDBOX_SQUARE_ACCESS_TOKEN,
    },
    production: {
        SQUARE_ENVIRONMENT: process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_ENVIRONMENT,
        SQUARE_LOCATION_ID: process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_LOCATION_ID,
        SQUARE_APPLICATION_ID: process.env.NEXT_PUBLIC_PRODUCTION_SQUARE_APPLICATION_ID,
        // SQUARE_ACCESS_TOKEN: process.env.PRODUCTION_SQUARE_ACCESS_TOKEN,
    },
}[env];

export default CONFIG;
