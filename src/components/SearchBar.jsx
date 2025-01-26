import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa"; // Import close icon from react-icons
import "./SearchBar.css"; // Import your CSS file for styling

const SearchBar = ({ searchResults, onSearch, onSelectCoin, onFocus }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1); // Track focused coin index
  const inputRef = useRef(null); // Ref for the input field
  const dropdownRef = useRef(null); // Ref for the dropdown

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Trigger search when typing
    setFocusedIndex(-1); // Reset focus when typing
  };

  // Handle coin selection
  const handleSelectCoin = (coin) => {
    onSelectCoin(coin);
    setQuery(""); // Clear the input after selecting a coin
    setIsFocused(false); // Close the dropdown
    setFocusedIndex(-1); // Reset focus
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    onFocus(); // Fetch trending coins when the search bar is focused
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay closing the dropdown to allow click events to register
    setTimeout(() => setIsFocused(false), 200);
  };

  // Clear search and close dropdown
  const handleClearSearch = () => {
    setQuery("");
    setIsFocused(false);
    setFocusedIndex(-1); // Reset focus
    inputRef.current.blur(); // Unfocus the input field
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFocused && !query) return; // Ignore if dropdown is not open

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case "Enter":
          if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
            handleSelectCoin(searchResults[focusedIndex]);
          }
          break;
        case "Escape":
          handleClearSearch();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, query, focusedIndex, searchResults]);

  // Scroll the focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const focusedItem = dropdownRef.current.children[focusedIndex];
      if (focusedItem) {
        focusedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [focusedIndex]);

  return (
    <div className={`search-bar ${isFocused || query ? "expanded" : ""}`}>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search for a meme coin..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={inputRef}
        />
        {(isFocused || query) && (
          <button className="close-button" onClick={handleClearSearch}>
            <FaTimes />
          </button>
        )}
      </div>
      {(isFocused || query) && (
        <ul className="search-results" ref={dropdownRef}>
          {searchResults.length > 0 ? (
            searchResults.map((coin, index) => (
              <li
                key={coin.id}
                onClick={() => handleSelectCoin(coin)}
                className={focusedIndex === index ? "focused" : ""}
              >
                <img
                  src={coin.image || "https://via.placeholder.com/50"}
                  alt={coin.name}
                  className="coin-image"
                />
                <div className="coin-info">
                  <span className="coin-name">{coin.name}</span>
                  <span className="coin-symbol">{coin.symbol}</span>
                  {coin.marketCap && (
                    <span className="coin-market-cap">{coin.marketCap}</span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="no-results">No results found</li>
          )}
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
      image: PropTypes.string,
      marketCap: PropTypes.string,
    })
  ).isRequired,
  onSearch: PropTypes.func.isRequired,
  onSelectCoin: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
};

export default SearchBar;