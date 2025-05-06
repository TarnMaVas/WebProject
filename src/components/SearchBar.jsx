import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles/SearchBar.css';
import { getOptions, filterSnippets } from '../firebase/services';

const SearchBar = ({ onFilter }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [groupedOptions, setGroupedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const options = await getOptions();
      setGroupedOptions(options || []);
    };
    
    fetchOptions();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    const filteredResults = await filterSnippets(searchText, selectedTags);
    onFilter(filteredResults);
    setIsLoading(false);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar"
        placeholder="Search snippets..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <Select
        className="multi-select"
        classNamePrefix="react-select"
        options={groupedOptions}
        value={selectedTags}
        onChange={setSelectedTags}
        isMulti
        isSearchable
        placeholder="Filter by tags..."
        isDisabled={groupedOptions.length === 0}
      />
      
      <button 
        className="search-btn" 
        onClick={handleSearch}
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </div>
  );
};

export default SearchBar;