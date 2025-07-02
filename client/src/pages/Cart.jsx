import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const { cart, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (item, value) => {
    const newQuantity = value === "" ? 0 : Number(value);

    if (!isNaN(newQuantity) && newQuantity >= 0 && Number.isInteger(newQuantity)) {
      updateQuantity(item.name, item.restaurantId, newQuantity);
      if (newQuantity === 0) {
        toast.warn(`${item.name} quantity set to 0.`, {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }
  };

  const handleRemoveItem = (item) => {
    removeItem(item.name, item.restaurantId);
    toast.warn(`${item.name} has been removed from the cart.`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link to="/restaurants" className="text-red-500 underline">
            Browse restaurants
          </Link>
        </p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={`${item.name}-${item.restaurantId}`} className="flex justify-between items-center border-b py-4">
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p>₹ {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity || 0}
                    onChange={(e) => handleQuantityChange(item, e.target.value)}
                    className="w-16 border rounded px-2 py-1"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-xl font-bold">Total: ₹ {totalPrice.toFixed(2)}</p>
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate("/checkout")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;