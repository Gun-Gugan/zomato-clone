import axios from 'axios';

const API = axios.create({
  baseURL: 'https://zomato-clone-server-78u6.onrender.com/api',
});

export const fetchMealTypes = () => API.get('/meal-types');
export const fetchRestaurants = () => API.get('/restaurants');
