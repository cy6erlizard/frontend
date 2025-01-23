import { useState } from "react";
import SearchBar from "./components/SearchBar";
import BubbleCanvas from "./components/BubbleCanvas";
import CoinDetailsModal from "./components/CoinDetailsModal";

// Mock bubble data
const mockBubbles = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    size: 30,
    color: "orange",
    position: { x: 100, y: 150 },
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    size: 25,
    color: "blue",
    position: { x: 300, y: 250 },
  },
  {
    name: "Cardano",
    symbol: "ADA",
    size: 20,
    color: "green",
    position: { x: 500, y: 100 },
  },
];

const App = () => {
  const [bubbles, setBubbles] = useState(mockBubbles); // Initialize with mock data
  const [selectedCoin, setSelectedCoin] = useState(null);

  const handleSearch = (coin) => {
    const existingBubble = bubbles.find((b) => b.name === coin.name);
    if (existingBubble) {
      // Increment size if bubble already exists
      setBubbles((prev) =>
        prev.map((b) =>
          b.name === coin.name ? { ...b, size: b.size + 50 } : b
        )
      );
    } else {
      // Add new bubble
      setBubbles([
        ...bubbles,
        {
          name: coin.name,
          symbol: coin.symbol,
          size: 90,
          color: "blue",
          position: { x: Math.random() * 800, y: Math.random() * 600 },
        },
      ]);
    }
  };

  const handleBubbleClick = (bubble) => {
    setSelectedCoin(bubble);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <BubbleCanvas bubbles={bubbles} onBubbleClick={handleBubbleClick} />
      {selectedCoin && (
        <CoinDetailsModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
        />
      )}
    </div>
  );
};

export default App;
