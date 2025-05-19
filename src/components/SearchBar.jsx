import { useState, useEffect } from "react";
import Select from "react-select";
import "../styles/SearchBar.css";
import { getOptions } from "../firebase/services";
import { useToast } from "./ToastProvider";
import { useFirebaseWithNotifications } from "../hooks/useFirebaseWithNotifications";

const SearchBar = ({ onSearch, onSearchStart, onSearchEnd, isLoading }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [groupedOptions, setGroupedOptions] = useState([]);
  const { filterSnippets } = useFirebaseWithNotifications();
  const toast = useToast();

  useEffect(() => {
    const fetchOptions = async () => {
      const options = await getOptions();
      setGroupedOptions(options || []);
    };

    fetchOptions();
  }, []);

  const handleSearch = async () => {
    if (onSearchStart) {
      onSearchStart();
    }

    try {
      const filteredResults = await filterSnippets(searchText, selectedTags);
      onSearch(filteredResults);

      if (filteredResults.length === 0) {
        toast.showInfo("No matching snippets found for your search");
      } else if (filteredResults.length > 0) {
        toast.showSuccess(`Found ${filteredResults.length} matching snippets`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.showError("An error occurred while searching. Please try again.");
    } finally {
      if (onSearchEnd) {
        onSearchEnd();
      }
    }
  };
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar"
        placeholder="Search snippets..."
        value={searchText}
        id="search-snippets-input"
        name="search-snippets"
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isLoading) {
            handleSearch();
          }
        }}
      />

      <Select
        className="multi-select"
        classNamePrefix="my-select"
        options={groupedOptions}
        value={selectedTags}
        onChange={setSelectedTags}
        isMulti
        isSearchable={false}
        placeholder="Filter by tags..."
        isDisabled={groupedOptions.length === 0}
        id="tags-filter-select"
        name="tags-filter"
        inputId="tags-filter-input"
      />

      <button
        className="search-btn"
        onClick={handleSearch}
        disabled={isLoading}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
