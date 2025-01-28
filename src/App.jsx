import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import SearchBar from "./components/SearchBar";
import Canvas from "./components/Canvas";
import CoinModal from "./components/CoinModal";
import Navbar from "./components/Navbar";
import "./index.css";

// Function to push overlapping coins apart
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
    return false;
  }
  const overlap = minDist - dist;
  const angle = Math.atan2(dy, dx);

  const aIsDragged = coinA.id === draggedCoinId;
  const bIsDragged = coinB.id === draggedCoinId;

  if (aIsDragged && bIsDragged) {
    // Rare scenario
    const shift = overlap / 2;
    coinA.x -= Math.cos(angle) * shift;
    coinA.y -= Math.sin(angle) * shift;
    coinB.x += Math.cos(angle) * shift;
    coinB.y += Math.sin(angle) * shift;
  } else if (aIsDragged && !bIsDragged) {
    coinB.x += Math.cos(angle) * overlap;
    coinB.y += Math.sin(angle) * overlap;
  } else if (!aIsDragged && bIsDragged) {
    coinA.x -= Math.cos(angle) * overlap;
    coinA.y -= Math.sin(angle) * overlap;
  } else {
    // Symmetrical push
    const shift = overlap / 2;
    coinA.x -= Math.cos(angle) * shift;
    coinA.y -= Math.sin(angle) * shift;
    coinB.x += Math.cos(angle) * shift;
    coinB.y += Math.sin(angle) * shift;
  }

  return true;
}

function resolveAllCollisions(coins, draggedCoinId) {
  const updated = [...coins];
  const MAX_ITERS = 20;

  for (let iter = 0; iter < MAX_ITERS; iter++) {
    let anyCollision = false;
    for (let i = 0; i < updated.length; i++) {
      for (let j = i + 1; j < updated.length; j++) {
        const collided = pushApartIfColliding(draggedCoinId, updated[i], updated[j]);
        if (collided) anyCollision = true;
      }
    }
    if (!anyCollision) break;
  }
  return updated;
}

const App = () => {
  const [coins, setCoins] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // Placeholder address (fetched from DB if needed, for now just hardcoded)
  const coinAddress = "0x123456789abcdef";

  // ----------------------------------------------------------------
  // Step 1: On mount, load coin sizes from DB + re-fetch details from CoinGecko
  // ----------------------------------------------------------------
  useEffect(() => {
    // 1) Fetch the stored coin sizes
    axios.get("http://localhost:5000/api/coins/sizes")
      .then(async (res) => {
        const dbSizes = res.data; // e.g. [ { coinId, baseSize } ]

        if (!dbSizes.length) return; // No coins => done

        // We can fetch their details from the free /coins/markets?vs_currency=usd&ids=... endpoint
        // If we have multiple coinIds, we can pass them all at once, e.g. "bitcoin,dogecoin"
        const allIds = dbSizes.map((c) => c.coinId).join(",");
        // Example call:
        const cgResponse = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${allIds}`
        );
        // cgResponse.data => array of { id, name, symbol, image, etc. }
        // Merge baseSize from DB
        const fetchedCoins = cgResponse.data.map((cgCoin) => {
          // find matching baseSize from DB
          const match = dbSizes.find((s) => s.coinId === cgCoin.id);
          return {
            id: cgCoin.id,
            name: cgCoin.name,
            symbol: cgCoin.symbol,
            image: cgCoin.image,
            price: cgCoin.current_price || "",
            marketCap: cgCoin.market_cap || "",
            baseSize: match ? match.baseSize : 50,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          };
        });

        // Now we have full coin data to display
        setCoins(fetchedCoins);
      })
      .catch((err) => {
        console.error("Failed to load coin sizes or CG data:", err);
      });

    // 2) Socket.io for real-time size updates
    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("coinSizeUpdated", ({ coinId, newSize }) => {
      setCoins((prev) =>
        prev.map((c) => {
          if (c.id === coinId) {
            return { ...c, baseSize: newSize };
          }
          return c;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ----------------------------------------------------------------
  // Searching for coins
  // ----------------------------------------------------------------
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

  // ----------------------------------------------------------------
  // Add or Grow Coin
  // ----------------------------------------------------------------
  const addCoin = (coin) => {
    setCoins((prevCoins) => {
      const existing = prevCoins.find((c) => c.id === coin.id);
      let updated = [...prevCoins];

      if (existing) {
        // If the coin is already in local state => ask server to increment baseSize
        axios
          .put("http://localhost:5000/api/coins/size", {
            coinId: coin.id,
            incrementSize: 500,
          })
          .then((res) => {
            console.log("Server updated coin size:", res.data);
            // The server will emit coinSizeUpdated -> local state updates automatically
          })
          .catch((err) => {
            console.error(err?.response?.data || err.message);
            alert(err?.response?.data?.error || "Failed to update size");
          });
      } else {
        // Not in local state => create new bubble
        const newBubble = {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          image: coin.image,
          price: coin.price,
          marketCap: coin.marketCap,
          baseSize: 50,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        };
        updated.push(newBubble);

        // Also tell server to create if not found (incrementSize=0)
        axios
          .put("http://localhost:5000/api/coins/size", {
            coinId: coin.id,
            incrementSize: 0,
          })
          .then((res) => {
            console.log("Created coin in DB:", res.data);
          })
          .catch((err) => {
            console.error("Error creating coin in DB:", err?.response?.data || err.message);
          });
      }

      // Locally resolve collisions (no "dragged" coin here)
      updated = resolveAllCollisions(updated, null);
      return updated;
    });
  };

  // ----------------------------------------------------------------
  // Bubble Click & Drag
  // ----------------------------------------------------------------
  const handleBubbleClick = (coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  const handleDragEnd = (id, x, y) => {
    setCoins((prev) => {
      let updated = prev.map((c) => (c.id === id ? { ...c, x, y } : c));
      // Freeze the dragged coin => push others
      updated = resolveAllCollisions(updated, id);
      return updated;
    });
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Navbar coinAddress={coinAddress} />
        <div className="app-content">
          <div className="canvas">
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
          </div>
          {selectedCoin && (
            <CoinModal
              coin={selectedCoin}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default App;
