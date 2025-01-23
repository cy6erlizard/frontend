import  { useState } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import Canvas from "./components/Canvas";
import CoinModal from "./components/CoinModal";
import "./index.css";

const App = () => {
  const [coins, setCoins] = useState([]); // List of coins
  const [searchResults, setSearchResults] = useState([]); // Autocomplete results
  const [selectedCoin, setSelectedCoin] = useState(null); // Selected coin for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  // Fetch meme coins from backend API
  const fetchCoins = async (query = "") => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/coins/search?query=${query}`
      );
      console.log("Fetched coins:", response.data); // Debugging
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  };

  // Add a new coin to the canvas
  const addCoin = (coin) => {
    console.log("Adding coin:", coin); // Debugging
    setCoins((prevCoins) => {
      // Check if the coin already exists
      const existingCoin = prevCoins.find((c) => c.id === coin.id);
  
      if (existingCoin) {
        // If the coin exists, increase its size
        return prevCoins.map((c) =>
          c.id === coin.id ? { ...c, size: c.size + 10 } : c
        );
      } else {
        // If the coin doesn't exist, add it to the canvas
        const newCoin = {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          marketCap: coin.marketCap,
          size: 50, // Initial size
          x: Math.random() * window.innerWidth, // Random position
          y: Math.random() * window.innerHeight,
          image: coin.image, // Use the image from the API response
        };
        return [...prevCoins, newCoin];
      }
    });
  };
  // Handle coin selection for modal
  const handleBubbleClick = (coin) => {
    console.log("Clicked coin:", coin); // Debugging
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  // Handle bubble drag end
  const handleDragEnd = (id, x, y) => {
    console.log("Dragged coin:", id, x, y); // Debugging
    setCoins((prevCoins) =>
      prevCoins.map((coin) =>
        coin.id === id ? { ...coin, x, y } : coin
      )
    );
  };

  return (
    <div className="app">
      <SearchBar
        searchResults={searchResults}
        onSearch={fetchCoins}
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
  );
};

export default App;