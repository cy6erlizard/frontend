import { useState } from "react";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SearchBar from "./components/SearchBar";
import Canvas from "./components/Canvas";
import CoinModal from "./components/CoinModal";
import "./index.css";

/**
 * pushApartIfColliding(draggedCoinId, coinA, coinB):
 *  - If one coin is the dragged coin, only move the other coin.
 *  - If neither is dragged (draggedCoinId=null or does not match), do symmetrical push.
 */
function pushApartIfColliding(draggedCoinId, coinA, coinB) {
  const aCenterX = coinA.x + coinA.baseSize / 2;
  const aCenterY = coinA.y + coinA.baseSize / 2;
  const aRadius = coinA.baseSize / 2;

  const bCenterX = coinB.x + coinB.baseSize / 2;
  const bCenterY = coinB.y + coinB.baseSize / 2;
  const bRadius = coinB.baseSize / 2;

  const dx = bCenterX - aCenterX;
  const dy = bCenterY - aCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = aRadius + bRadius;

  if (dist >= minDist || dist === 0) {
    return false; // No overlap or exactly same center
  }

  const overlap = minDist - dist;

  const aIsDragged = coinA.id === draggedCoinId;
  const bIsDragged = coinB.id === draggedCoinId;

  const angle = Math.atan2(dy, dx);

  if (aIsDragged && bIsDragged) {
    // Rare scenario if two coins had the same ID or both considered dragged.
    // We'll do symmetrical push for demonstration
    const shift = overlap / 2;
    const shiftAX = Math.cos(angle) * shift * -1;
    const shiftAY = Math.sin(angle) * shift * -1;
    const shiftBX = Math.cos(angle) * shift;
    const shiftBY = Math.sin(angle) * shift;
    coinA.x += shiftAX;
    coinA.y += shiftAY;
    coinB.x += shiftBX;
    coinB.y += shiftBY;
  } else if (aIsDragged && !bIsDragged) {
    // Only move coin B
    const shiftBX = Math.cos(angle) * overlap;
    const shiftBY = Math.sin(angle) * overlap;
    coinB.x += shiftBX;
    coinB.y += shiftBY;
  } else if (!aIsDragged && bIsDragged) {
    // Only move coin A
    const shiftAX = Math.cos(angle) * overlap * -1;
    const shiftAY = Math.sin(angle) * overlap * -1;
    coinA.x += shiftAX;
    coinA.y += shiftAY;
  } else {
    // Neither is dragged => symmetrical push
    const shift = overlap / 2;
    const shiftAX = Math.cos(angle) * shift * -1;
    const shiftAY = Math.sin(angle) * shift * -1;
    const shiftBX = Math.cos(angle) * shift;
    const shiftBY = Math.sin(angle) * shift;

    coinA.x += shiftAX;
    coinA.y += shiftAY;
    coinB.x += shiftBX;
    coinB.y += shiftBY;
  }

  return true;
}

/**
 * Repeatedly checks all pairs of coins for collisions and resolves them
 * until no collisions remain or we hit a max iteration count.
 *
 * If draggedCoinId is null, no coin is "dragged" => symmetrical push for all collisions.
 */
function resolveAllCollisions(coins, draggedCoinId) {
  const updatedCoins = [...coins];
  const MAX_ITERATIONS = 20;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let anyCollision = false;

    for (let i = 0; i < updatedCoins.length; i++) {
      for (let j = i + 1; j < updatedCoins.length; j++) {
        const coinA = updatedCoins[i];
        const coinB = updatedCoins[j];
        const collided = pushApartIfColliding(draggedCoinId, coinA, coinB);
        if (collided) anyCollision = true;
      }
    }

    if (!anyCollision) {
      // No collisions => done
      break;
    }
  }
  return updatedCoins;
}

const App = () => {
  const [coins, setCoins] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const fetchTrendingCoins = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/coins/trending");
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching trending coins:", error);
    }
  };

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

  const handleSearchBarFocus = () => {
    if (!isSearching) {
      fetchTrendingCoins();
    }
  };

  const handleSearchInputChange = (query) => {
    setIsSearching(query.length > 0);
    if (query.length > 0) {
      fetchCoins(query);
    } else {
      fetchTrendingCoins();
    }
  };

  // Add a new coin to the canvas, and ensure it doesn't collide from the start
  const addCoin = (coin) => {
    setCoins((prevCoins) => {
      const existingCoin = prevCoins.find((c) => c.id === coin.id);
      let updated = [...prevCoins];

      if (existingCoin) {
        // If coin is already on canvas, just increase its baseSize
        updated = updated.map((c) =>
          c.id === coin.id ? { ...c, baseSize: c.baseSize + 500 } : c
        );
      } else {
        // Otherwise create a new coin with some initial baseSize
        const newCoin = {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.price,
          marketCap: coin.marketCap,
          baseSize: 50,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          image: coin.image,
        };
        updated.push(newCoin);
      }

      // After adding the coin, run collision resolution with no dragged coin
      // => symmetrical push ensures the new coin won't overlap existing coins
      updated = resolveAllCollisions(updated, null);
      return updated;
    });
  };

  const handleBubbleClick = (coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  // On drag end, we freeze the dragged coin, push away others
  const handleDragEnd = (id, x, y) => {
    setCoins((prevCoins) => {
      let updated = prevCoins.map((coin) =>
        coin.id === id ? { ...coin, x, y } : coin
      );
      // Resolve collisions, pass the dragged coin ID so it won't move
      updated = resolveAllCollisions(updated, id);
      return updated;
    });
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
