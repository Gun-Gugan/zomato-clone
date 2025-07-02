import React, { useState } from 'react';

const Banner = ({ setSearchQuery }) => {
  const [input, setInput] = useState('');

  const handleSearch = (e) => {
    const query = e.target.value;
    setInput(query);
    setSearchQuery(query.toLowerCase());
  };

  return (
    <div
      className="bg-cover bg-center h-96 flex items-center justify-center text-white"
      style={{ backgroundImage: `url('Background.jpg')` }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold">Find the best restaurants, cafés, and bars</h1>
        <p className="mt-4 text-lg">Discover the best food near you</p>
        <input
          type="text"
          placeholder="Search for restaurants or dishes"
          value={input}
          onChange={handleSearch}
          className="mt-6 px-4 py-2 rounded-md w-96 text-center bg-white text-black placeholder-gray-500 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>
    </div>
  );
};

export default Banner;
