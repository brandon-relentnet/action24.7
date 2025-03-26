"use client";

import React, { useState, useEffect } from 'react';

const ShippingCalculator = () => {
    // Origin location (Baton Rouge, LA)
    const ORIGIN = {
        address: "Baton Rouge, LA, USA",
        lat: 30.4515,
        lng: -91.1871
    };

    // State for inputs
    const [quantity, setQuantity] = useState(1);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [address, setAddress] = useState('');
    const [distance, setDistance] = useState(null);
    const [cost, setCost] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState('');

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

    // Fetch coordinates from Nominatim (directly from the user's code)
    const getLatLong = async (address) => {
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
    };

    // Haversine formula (based on the user's code, but returning miles directly)
    const getDistanceInMiles = (lat1, lon1, lat2, lon2) => {
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
    };

    // Function to calculate distance using Nominatim and Haversine formula
    const calculateDistance = async () => {
        if (!address) {
            setError('Please enter a delivery address');
            return;
        }

        setIsCalculating(true);
        setError('');

        try {
            // Use the Origin coordinates we already have
            const originCoords = { lat: ORIGIN.lat, lng: ORIGIN.lng };

            // Get customer coordinates using Nominatim
            const customerCoords = await getLatLong(address);

            if (!customerCoords) {
                throw new Error("Could not find coordinates for the provided address");
            }

            // Calculate distance using Haversine formula
            const calculatedDistance = getDistanceInMiles(
                originCoords.lat,
                originCoords.lng,
                customerCoords.lat,
                customerCoords.lng
            );

            // Round to 2 decimal places
            setDistance(Math.round(calculatedDistance));
        } catch (error) {
            console.error("Error calculating distance:", error);
            setError(error.message || "Failed to calculate distance");
            // Fallback to a reasonable default
            setDistance(500);
        } finally {
            setIsCalculating(false);
        }
    };

    // Calculate shipping cost
    const calculateShippingCost = () => {
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
    };

    // Recalculate cost when relevant inputs change
    useEffect(() => {
        const newCost = calculateShippingCost();
        if (newCost !== null) {
            setCost(newCost);
        }
    }, [quantity, shippingMethod, distance]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        calculateDistance();
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Shipping Calculator</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Delivery Address</label>
                    <input
                        type="text"
                        placeholder="Enter full address (e.g. 123 Main St, New York, NY 10001)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter complete address including city, state and ZIP code for accurate calculation
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Shipping Method</label>
                    <select
                        value={shippingMethod}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="standard">Standard (3-5 business days)</option>
                        <option value="express">Express (2 business days)</option>
                        <option value="overnight">Overnight (Next business day)</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isCalculating}
                >
                    {isCalculating ? 'Calculating...' : 'Calculate Shipping'}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {distance !== null && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium">Distance:</span>
                        <span>{distance} miles</span>
                    </div>

                    {cost !== null && (
                        <div className="flex justify-between">
                            <span className="font-medium">Shipping Cost:</span>
                            <span className="font-bold">${cost}</span>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                        Shipping from: {ORIGIN.address}
                    </div>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
                <p>Note: This calculator provides an estimate based on straight-line distance. Actual shipping costs may vary.</p>
                <p>For international shipping, please contact customer service.</p>
            </div>
        </div>
    );
};

export default ShippingCalculator;