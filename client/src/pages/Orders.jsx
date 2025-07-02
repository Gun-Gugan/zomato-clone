import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.token) {
        toast.info("Please log in to view your orders.", {
          position: "top-right",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders`, config);
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.", {
            position: "top-right",
            autoClose: 2000,
          });
          logout();
          navigate("/login");
        } else {
          toast.error("Failed to fetch orders.", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, logout]);

  const handleReorder = (order) => {
    if (!user) {
      toast.info("Please log in to reorder.", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/login");
      return;
    }
    try {
      order.items.forEach((item) => {
        const cartItem = {
          name: item.name,
          price: item.price,
          description: item.description || "",
          image: item.image || "",
        };
        for (let i = 0; i < item.quantity; i++) {
          addToCart(cartItem);
        }
      });
      toast.success("Order items added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/cart");
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder items.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading your orders...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border p-4 rounded mb-4 shadow">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <ul className="mt-2">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} x {item.quantity} — ₹{' '}{(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="font-bold mt-2">Total: ₹{' '}{order.totalPrice.toFixed(2)}</p>
            <button
              onClick={() => handleReorder(order)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Reorder
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
