import { useState } from "react";
import PropTypes from "prop-types";

const SearchBar = ({ searchResults, onSearch, onSelectCoin }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleSelectCoin = (coin) => {
    onSelectCoin(coin);
    setQuery("");
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for a meme coin..."
        value={query}
        onChange={handleInputChange}
      />
      {query && (
        <ul className="search-results">
          {searchResults.map((coin) => (
            <li key={coin.id} onClick={() => handleSelectCoin(coin)}>
              {coin.name} ({coin.symbol})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  searchResults: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSearch: PropTypes.func.isRequired,
  onSelectCoin: PropTypes.func.isRequired,
};

export default SearchBar;