import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/restaurants`, {
          timeout: 5000, 
        });
        if (!res.data || !Array.isArray(res.data)) {
          throw new Error("Invalid data received from server");
        }
        setRestaurants(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch restaurants:", err.message, err);
        setError(
          err.code === "ECONNABORTED"
            ? "Request timed out. Please check if the server is running at http://localhost:5000."
            : err.response?.status === 404
            ? "No restaurants found"
            : `Failed to load restaurants: ${err.message}. Please try again later.`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const handleAddToCart = (item) => {
    if (!user) {
      // If user is not logged in, redirect to login page
      toast.info("Please log in to add items to your cart.", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/login");
      return;
    }
    try {
      addToCart(item);
      toast.success(`${item.name} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart.");
    }
  };

  const filtered = restaurants.filter(
    (r) =>
      (cuisine === "all" || r.cuisine === cuisine) &&
      r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search restaurants..."
          className="w-full sm:w-1/2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          onChange={(e) => setCuisine(e.target.value)}
          className="w-full sm:w-1/4 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={cuisine}
        >
          <option value="all">All Cuisines</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Italian">Italian</option>
          <option value="Indian">Indian</option>
          <option value="Mexican">Mexican</option>
          <option value="French">French</option>
          <option value="Thai">Thai</option>
          <option value="Mediterranean">Mediterranean</option>
          <option value="American">American</option>
          <option value="Vegan">Vegan</option>
          <option value="Korean">Korean</option>
          <option value="Ethiopian">Ethiopian</option>
          <option value="Brazilian">Brazilian</option>
          <option value="Greek">Greek</option>
        </select>
      </div>

      {loading && (
        <div className="text-center p-6 text-gray-600">Loading restaurants...</div>
      )}
      {error && (
        <div className="text-red-500 text-center p-6 font-semibold">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center p-6 text-gray-600">
          No restaurants match your search.
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <div
              key={restaurant._id}
              className="border rounded-lg shadow-md p-6 bg-white hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {restaurant.name}
              </h2>
              <p className="text-gray-600 mb-1">
                Cuisine: {restaurant.cuisine || "Unknown cuisine"}
              </p>
              <p className="text-gray-600 mb-4">
                Rating:{" "}
                {restaurant.rating
                  ? restaurant.rating.toFixed(1)
                  : "Not rated"}
              </p>
              {restaurant.menu && restaurant.menu.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Menu
                  </h3>
                  <div className="space-y-4">
                    {restaurant.menu.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-start border-t pt-4"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) =>
                            (e.target.src = "https://via.placeholder.com/150")
                          }
                        />
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-800">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.description || "No description available"}
                          </p>
                          <p className="text-base font-semibold text-green-600">
                            ₹{' '}{item.price.toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
