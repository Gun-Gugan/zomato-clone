import axios from 'axios';

const API = axios.create({
  baseURL: 'https://zomato-clone-utd8.onrender.com/api',
});

export const fetchMealTypes = () => API.get('/meal-types');
export const fetchRestaurants = () => API.get('/restaurants');
