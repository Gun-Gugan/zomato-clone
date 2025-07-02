import React, { useState } from 'react';
import Banner from '../components/Banner';
import MealTypes from '../components/MealTypes';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <Banner setSearchQuery={setSearchQuery} />
      <MealTypes searchQuery={searchQuery} />
    </div>
  );
};

export default Home;
