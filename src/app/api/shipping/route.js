// app/api/shipping/route.js
import { NextResponse } from 'next/server';

// Origin location (Baton Rouge, LA)
const ORIGIN = {
    address: "Baton Rouge, LA, USA",
    lat: 30.4515,
    lng: -91.1871
};

// Shipping rate constants
const RATES = {
    standard: {
        baseRate: 5.99,
        weightRate: 0.75, // per pound
        distanceRate: 0.01, // per mile
    },
    express: {
        baseRate: 9.99,
        weightRate: 1.25,
        distanceRate: 0.03,
    },
    overnight: {
        baseRate: 19.99,
        weightRate: 2,
        distanceRate: 0.05,
    }
};

// Fetch coordinates from Nominatim
async function getLatLong(address) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        throw new Error("Failed to get coordinates");
    }
}

// Haversine formula to calculate distance in miles
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius (km)
    const deg2rad = (deg) => deg * (Math.PI / 180);

    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = R * c;

    // Convert to miles
    return distKm * 0.621371;
}

// Calculate shipping cost
function calculateShippingCost(distance, shippingMethod, quantity) {
    if (distance === null) return null;

    const box = { length: 14, width: 10, height: 4, weight: 1 };
    const rate = RATES[shippingMethod];

    // Calculate total weight
    const totalWeight = box.weight * quantity;

    // Formula: Base rate + (weight cost) + (distance cost)
    const shippingCost = rate.baseRate +
        (totalWeight * rate.weightRate) +
        (distance * rate.distanceRate);

    return parseFloat(shippingCost.toFixed(2));
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { address, city, state, zipCode, country, shippingMethod, quantity = 1 } = data;

        if (!address || !city || !state || !zipCode) {
            return NextResponse.json(
                { error: 'Missing required shipping information' },
                { status: 400 }
            );
        }

        // Build full address for geocoding
        const fullAddress = `${address}, ${city}, ${state} ${zipCode}, ${country || 'USA'}`;

        // Get coordinates for the address
        const customerCoords = await getLatLong(fullAddress);

        if (!customerCoords) {
            return NextResponse.json(
                { error: 'Could not find coordinates for the provided address' },
                { status: 400 }
            );
        }

        // Calculate distance
        const distance = getDistanceInMiles(
            ORIGIN.lat,
            ORIGIN.lng,
            customerCoords.lat,
            customerCoords.lng
        );

        // Round distance to whole miles
        const roundedDistance = Math.round(distance);

        // Calculate shipping cost
        const shippingCost = calculateShippingCost(
            roundedDistance,
            shippingMethod || 'standard',
            quantity
        );

        // Return the calculated shipping information
        return NextResponse.json({
            success: true,
            distance: roundedDistance,
            shippingCost,
            origin: ORIGIN.address,
            method: shippingMethod || 'standard'
        });
    } catch (error) {
        console.error('Shipping calculation error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate shipping cost', message: error.message },
            { status: 500 }
        );
    }
}