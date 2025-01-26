import { useState } from "react";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SearchBar from "./components/SearchBar";
import Canvas from "./components/Canvas";
import CoinModal from "./components/CoinModal";
import "./index.css";

const App = () => {
  const [coins, setCoins] = useState([]); // List of coins
  const [searchResults, setSearchResults] = useState([]); // Autocomplete results
  const [selectedCoin, setSelectedCoin] = useState(null); // Selected coin for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isSearching, setIsSearching] = useState(false); // Track if user is typing

  // Fetch trending coins from backend API
  const fetchTrendingCoins = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/coins/trending");
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching trending coins:", error);
    }
  };

  // Fetch meme coins from backend API
  const fetchCoins = async (query = "") => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/coins/search?query=${query}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  };

  // Handle search bar focus
  const handleSearchBarFocus = () => {
    if (!isSearching) {
      fetchTrendingCoins();
    }
  };

  // Handle search input change
  const handleSearchInputChange = (query) => {
    setIsSearching(query.length > 0);
    if (query.length > 0) {
      fetchCoins(query);
    } else {
      fetchTrendingCoins();
    }
  };

  // Add a new coin to the canvas
  const addCoin = (coin) => {
    setCoins((prevCoins) => {
      const existingCoin = prevCoins.find((c) => c.id === coin.id);
      if (existingCoin) {
        return prevCoins.map((c) =>
          c.id === coin.id ? { ...c, size: c.size + 10 } : c
        );
      } else {
        const newCoin = {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          marketCap: coin.marketCap,
          size: 50,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          image: coin.image,
        };
        return [...prevCoins, newCoin];
      }
    });
  };

  // Handle coin selection for modal
  const handleBubbleClick = (coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  // Handle bubble drag end
  const handleDragEnd = (id, x, y) => {
    setCoins((prevCoins) =>
      prevCoins.map((coin) => (coin.id === id ? { ...coin, x, y } : coin))
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <SearchBar
          searchResults={searchResults}
          onSearch={handleSearchInputChange}
          onFocus={handleSearchBarFocus}
          onSelectCoin={addCoin}
        />
        <Canvas
          coins={coins}
          onBubbleClick={handleBubbleClick}
          onDragEnd={handleDragEnd}
        />
        {selectedCoin && (
          <CoinModal
            coin={selectedCoin}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default App;