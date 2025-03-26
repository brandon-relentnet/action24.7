// app/context/SquareOrderContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SquareOrderContext = createContext();

export function SquareOrderProvider({ children }) {
    const [orderId, setOrderId] = useState(null);
    const [versionId, setVersionId] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [orderCalculation, setOrderCalculation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // On mount, load orderId from localStorage and update order state if found.
    useEffect(() => {
        const storedOrderId = localStorage.getItem("squareOrderId");
        if (storedOrderId) {
            setOrderId(storedOrderId);
            updateOrderState(storedOrderId);
        }
    }, []);

    // Helper function to make API calls.
    const apiCall = async (url, body = null) => {
        const options = {
            method: body ? "POST" : "GET",
            headers: { "Content-Type": "application/json" },
            ...(body && { body: JSON.stringify(body) }),
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }
        return response.json();
    };

    // Updates order details and calculation concurrently.
    const updateOrderState = async (id) => {
        setIsLoading(true);
        try {
            const [detailsData, calculationData] = await Promise.all([
                apiCall(`/api/orders/${id}`),
                apiCall(`/api/orders/${id}/calculate`),
            ]);

            if (!detailsData.order) {
                throw new Error("Invalid order data returned from API");
            }
            setVersionId(detailsData.order.version || 1);
            setOrderItems(detailsData.order.lineItems || []);
            setOrderCalculation(calculationData);
        } catch (err) {
            console.error("Error updating order state:", err);
            setError(err.message);
            // Remove orderId if order not found.
            if (err.message.includes("404") || err.message.includes("not found")) {
                localStorage.removeItem("squareOrderId");
                setOrderId(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const addItemToOrder = async (item) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!orderId) {
                // Create new order if none exists.
                const data = await apiCall("/api/orders/create", {
                    cartItems: [{ ...item, quantity: 1 }],
                });
                console.log("Payload for create/update:", { ...item, quantity: 1 });
                const newOrderId = data.order.id;
                localStorage.setItem("squareOrderId", newOrderId);
                setOrderId(newOrderId);
                await updateOrderState(newOrderId);
            } else {
                // Update existing order with the new item.
                await apiCall(`/api/orders/${orderId}/update`, {
                    action: "add_item",
                    itemData: { ...item, quantity: 1 },
                    versionId,
                });
                await updateOrderState(orderId);
            }
        } catch (err) {
            console.error("Error adding item to order:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const updateItemQuantity = async (lineItemId, newQuantity) => {
        if (!orderId) return;
        setIsLoading(true);
        try {
            await apiCall(`/api/orders/${orderId}/update`, {
                action: "update_quantity",
                lineItemId,
                quantity: newQuantity,
                versionId,
            });
            await updateOrderState(orderId);
        } catch (err) {
            console.error("Error updating item quantity:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const removeItemFromOrder = async (lineItemId) => {
        if (!orderId) return;
        setIsLoading(true);
        try {
            await apiCall(`/api/orders/${orderId}/update`, {
                action: "remove_item",
                lineItemId,
                versionId,
                quantity: 0,
            });
            await updateOrderState(orderId);
        } catch (err) {
            console.error("Error removing item:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const clearOrder = async () => {
        if (!orderId) return;
        try {
            await apiCall(`/api/orders/${orderId}/update`, {
                action: "clear_order",
                versionId,
            });
            localStorage.removeItem("squareOrderId");
            setOrderId(null);
            setOrderItems([]);
            setOrderCalculation(null);
        } catch (err) {
            console.error("Error canceling order:", err);
            setError(err.message);
        }
    };

    const totalItems = orderItems.reduce(
        (total, item) => total + (parseInt(item.quantity) || 0),
        0
    );

    const value = {
        orderId,
        orderItems,
        isLoading,
        error,
        addItemToOrder,
        updateItemQuantity,
        removeItemFromOrder,
        clearOrder,
        totalItems,
        updateOrderState,
        orderCalculation,
    };

    return (
        <SquareOrderContext.Provider value={value}>
            {children}
        </SquareOrderContext.Provider>
    );
}

export function useSquareOrder() {
    return useContext(SquareOrderContext);
}
