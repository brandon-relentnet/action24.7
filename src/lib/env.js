const APP_ENV = (process.env.APP_ENV || 'sandbox').toUpperCase();

const ENV_VARS = {
    SQUARE_ACCESS_TOKEN: process.env[`${APP_ENV}_SQUARE_ACCESS_TOKEN`],
    SQUARE_ENVIRONMENT: process.env[`${APP_ENV}_SQUARE_ENVIRONMENT`],
    SQUARE_LOCATION_ID: process.env[`${APP_ENV}_SQUARE_LOCATION_ID`]
};

export default ENV_VARS;
