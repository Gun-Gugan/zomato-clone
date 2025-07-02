import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const fetchMealTypes = () => API.get('/meal-types');
export const fetchRestaurants = () => API.get('/restaurants');
