// /app/context/CartContext.js
"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage only once on initial render
    useEffect(() => {
        const storedCart = localStorage.getItem("cartItems");
        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (e) {
                console.error("Error parsing stored cart:", e);
                // Reset to empty cart if parse fails
                setCartItems([]);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever it changes, but only after initialization
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        }
    }, [cartItems, isInitialized]);

    // Add a new item to cart
    const addToCart = useCallback((item) => {
        console.log("Adding new item to cart:", item.id);

        setCartItems(prevItems => {
            // Check if the item already exists in the cart
            const existingItem = prevItems.find(cartItem => cartItem.id === item.id);

            if (existingItem) {
                // If it exists, don't add it again - the setQuantity function should be used instead
                return prevItems;
            } else {
                // Item doesn't exist, add it with quantity of 1
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });
    }, []);

    // Directly set a specific quantity for an item
    const setQuantity = useCallback((id, newQuantity) => {
        console.log(`Setting quantity for item ${id} to ${newQuantity}`);

        if (newQuantity < 1) {
            // If quantity is less than 1, remove the item
            setCartItems(prevItems => prevItems.filter(item => item.id !== id));
            return;
        }

        setCartItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === id) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    }, []);

    // Remove an item completely
    const removeItem = useCallback((id) => {
        console.log(`Removing item ${id} from cart`);
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    // Clear the entire cart
    const clearCart = useCallback(() => {
        console.log("Clearing entire cart");
        setCartItems([]);
    }, []);

    // Calculate total quantity of items in cart
    const totalItems = cartItems.reduce((total, item) => {
        return total + (item.quantity || 1);
    }, 0);

    const contextValue = {
        cartItems,
        addToCart,
        setQuantity,
        removeItem,
        clearCart,
        totalItems,
        // Legacy functions for backward compatibility
        removeFromCart: removeItem,
        removeItemCompletely: removeItem,
        incrementQuantity: (id) => {
            const item = cartItems.find(item => item.id === id);
            if (item) {
                setQuantity(id, (item.quantity || 1) + 1);
            }
        },
        decrementQuantity: (id) => {
            const item = cartItems.find(item => item.id === id);
            if (item) {
                setQuantity(id, (item.quantity || 1) - 1);
            }
        }
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}