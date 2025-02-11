// /app/context/CartContext.js
"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    function addToCart(item) {
        console.log("Adding item to cart:", item); // Debug log
        setCartItems((prev) => [...prev, item]);
    }

    function removeFromCart(id) {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    }

    function clearCart() {
        setCartItems([]);
    }

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
