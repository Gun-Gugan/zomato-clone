import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders`, config);
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      }
    };
    fetchOrders();
  }, []);

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
                  {item.name} x {item.quantity} — ${ (item.price * item.quantity).toFixed(2) }
                </li>
              ))}
            </ul>
            <p className="font-bold mt-2">Total: ${order.totalPrice.toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
