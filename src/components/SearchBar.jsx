import React from 'react';
import '../styles/SearchBar.css';

const SearchBar = () => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar"
        placeholder="Search snippets..."
      />
      <button className="search-btn">Search</button>
    </div>
  );
};

export default SearchBar;