import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const hasZeroQuantity = cart.some(item => item.quantity === 0);

  const placeOrder = async () => {
    if (!user?.token) {
      toast.info('Please log in to place an order.', {
        position: 'top-right',
        autoClose: 2000,
      });
      navigate('/login');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { items: cart, totalPrice };
      console.log('Order payload:', JSON.stringify(payload, null, 2));
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/orders`,
        payload,
        config
      );
      toast.success('Order placed successfully!', {
        position: 'top-right',
        autoClose: 2000,
      });
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Order error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', {
          position: 'top-right',
          autoClose: 2000,
        });
        logout();
        navigate('/login');
      } else {
        toast.error(
          error.response?.data?.error || 'Failed to place order. Please check your cart.',
          {
            position: 'top-right',
            autoClose: 2000,
          }
        );
      }
    }
  };

  if (!cart.length) {
    return <p className="text-center mt-10">Your cart is empty.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <ul>
        {cart.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex justify-between border-b py-4">
            <span>{item.name} x {item.quantity}</span>
            <span>₹ {(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xl font-bold mt-6">Total: ₹ {totalPrice.toFixed(2)}</p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate('/cart')}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={placeOrder}
          disabled={hasZeroQuantity}
          className={`bg-green-600 text-white px-6 py-2 rounded transition-colors ${
            hasZeroQuantity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
          }`}
        >
          Place Order
        </button>
      </div>
      {hasZeroQuantity && (
        <p className="text-red-500 mt-2">
          Please remove or update items with zero quantity before placing the order.
        </p>
      )}
    </div>
  );
};

export default Checkout;