import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { fetchMealTypes } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 

const MealTypes = ({ searchQuery }) => {
  const [meals, setMeals] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await fetchMealTypes();
        setMeals(data);
      } catch (err) {
        console.error('Error fetching meal types', err);
      }
    };
    getData();
  }, []);

  const filteredMeals = meals.filter(
    (meal) =>
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (meal) => {

    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    const cartItem = {
      ...meal,
      price: meal.price || 299.99, 
      quantity: 1, 
      restaurantId: meal.restaurantId || '68522d746255d89a9c1fcad3', 
    };
    addToCart(cartItem);
  };

  return (
    <div className="py-10 px-6">
      <h2 className="text-2xl font-bold mb-6">Explore Meal Types</h2>
      {filteredMeals.length === 0 && searchQuery && (
        <p className="text-center text-gray-600">No meals found.</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredMeals.map((meal, index) => (
          <div
            key={index}
            className="rounded-lg shadow-md overflow-hidden flex flex-col h-full"
          >
            <img
              src={meal.image}
              alt={meal.name}
              className="w-full h-40 object-cover"
            />
            <div className=" flex flex-col flex-grow">
              <div className="text-left flex-grow">
                <h3 className="font-semibold text-lg line-clamp-2">{meal.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{meal.description}</p>
                <p className="font-bold mt-2">₹{(meal.price || 299.99).toFixed(2)}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleAddToCart(meal)}
                  className="bg-red-500 text-white px-5 py-3 rounded-md hover:bg-red-600 transition-colors flex items-center text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealTypes;
