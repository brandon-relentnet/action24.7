// app/context/SquareOrderContext.js
"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SquareOrderContext = createContext();

export function SquareOrderProvider({ children }) {
    const [orderId, setOrderId] = useState(null);
    const [versionId, setVersionId] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load order ID from localStorage on initial render
    useEffect(() => {
        const storedOrderId = localStorage.getItem("squareOrderId");
        if (storedOrderId) {
            setOrderId(storedOrderId);
            // Fetch the current order details
            fetchOrderDetails(storedOrderId);
        }
    }, []);

    // Fetch current order details
    const fetchOrderDetails = async (id) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch order: ${response.status}`);
            }

            const data = await response.json();

            console.log('Fetched order details:', data);

            if (!data.order) {
                throw new Error('Invalid order data returned from API');
            }

            setVersionId(data.order.version);
            setOrderItems(data.order.lineItems || []);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError(err.message);

            // If the order doesn't exist, clear it from localStorage
            if (err.message.includes('404') || err.message.includes('not found')) {
                localStorage.removeItem("squareOrderId");
                setOrderId(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Add an item to the order
    const addItemToOrder = async (item) => {
        setIsLoading(true);
        setError(null);

        try {
            // If no order exists, create a new one
            if (!orderId) {
                const response = await fetch('/api/orders/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartItems: [{ ...item, quantity: 1 }] })
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                const newOrderId = data.order.id;

                // Save the order ID to localStorage and state
                localStorage.setItem("squareOrderId", newOrderId);
                setOrderId(newOrderId);
                await fetchOrderDetails(newOrderId);
            } else {
                // Order exists, update it with the new item
                const response = await fetch(`/api/orders/${orderId}/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'add_item',
                        itemData: { ...item, quantity: 1 },
                        versionId
                    })
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                await fetchOrderDetails(orderId);
            }
        } catch (err) {
            console.error('Error adding item to order:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Update item quantity in the order
    const updateItemQuantity = async (lineItemId, newQuantity) => {
        if (!orderId) return;
        setIsLoading(true);

        try {
            const response = await fetch(`/api/orders/${orderId}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_quantity',
                    lineItemId,
                    quantity: newQuantity
                })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            await fetchOrderDetails(orderId);
        } catch (err) {
            console.error('Error updating item quantity:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Remove an item from the order
    const removeItemFromOrder = async (lineItemId) => {
        if (!orderId) return;
        setIsLoading(true);

        try {
            const response = await fetch(`/api/orders/${orderId}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'remove_item',
                    lineItemId,
                    versionId,
                    quantity: 0
                })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            await fetchOrderDetails(orderId);
        } catch (err) {
            console.error('Error removing item:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Clear/cancel order
    const clearOrder = async () => {
        if (!orderId) return;

        try {
            const response = await fetch(`/api/orders/${orderId}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'clear_order',
                    versionId
                })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            // Clear local storage and state
            localStorage.removeItem("squareOrderId");
            setOrderId(null);
            setOrderItems([]);
        } catch (err) {
            console.error('Error canceling order:', err);
            setError(err.message);
        }
    };

    // Calculate total quantity of items
    const totalItems = orderItems.reduce((total, item) => {
        return total + (parseInt(item.quantity) || 0);
    }, 0);

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
        fetchOrderDetails
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