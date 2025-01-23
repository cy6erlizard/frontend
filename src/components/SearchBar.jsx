import  { useState } from "react";
import PropTypes from "prop-types";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/coins/search?query=${query}`);
      const data = await response.json();
      onSearch(data);
    } catch (error) {
      console.error("Error fetching coin data:", error);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Coin..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
