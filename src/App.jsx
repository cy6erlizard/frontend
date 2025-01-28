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

// (Same collision logic as before)
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
  if (dist >= minDist || dist === 0) return false;

  const overlap = minDist - dist;
  const angle = Math.atan2(dy, dx);

  const aIsDragged = coinA.id === draggedCoinId;
  const bIsDragged = coinB.id === draggedCoinId;

  if (aIsDragged && bIsDragged) {
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
  const MAX_ITER = 20;
  for (let i = 0; i < MAX_ITER; i++) {
    let anyCollision = false;
    for (let a = 0; a < updated.length; a++) {
      for (let b = a + 1; b < updated.length; b++) {
        const collided = pushApartIfColliding(draggedCoinId, updated[a], updated[b]);
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
  const [coinAddress, setCoinAddress] = useState("0xPLACEHOLDER"); // from DB

  // On mount, connect socket + load coin sizes + load placeholder address
  useEffect(() => {
    // 1) Load coin address placeholder from DB
    axios.get("http://localhost:5000/api/settings/address")
      .then((res) => {
        setCoinAddress(res.data.coinAddress);
      })
      .catch((err) => console.error("Failed to load coin address:", err));

    // 2) Load coin sizes from DB
    axios.get("http://localhost:5000/api/coins/sizes")
      .then(async (res) => {
        const dbSizes = res.data; // e.g. [ { coinId, baseSize }, ... ]
        if (!dbSizes.length) return;

        // Re-fetch details from Coingecko
        const allIds = dbSizes.map((c) => c.coinId).join(",");
        // e.g. "bitcoin,dogecoin"
        const cgResp = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${allIds}`
        );
        // Merge baseSize from DB
        const fetchedCoins = cgResp.data.map((cgCoin) => {
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
        setCoins(fetchedCoins);
      })
      .catch((err) => {
        console.error("Failed to load coins/sizes:", err);
      });

    // 3) Connect Socket.IO
    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("coinSizeUpdated", ({ coinId, newSize }) => {
      // Update local state
      setCoins((prev) =>
        prev.map((c) =>
          c.id === coinId ? { ...c, baseSize: newSize } : c
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --------------------
  // Search Logic
  // --------------------
  const fetchTrendingCoins = async () => {
    try {
      const resp = await axios.get("http://localhost:5000/api/coins/trending");
      setSearchResults(resp.data);
    } catch (err) {
      console.error("Error fetching trending coins:", err);
    }
  };
  const fetchCoins = async (query) => {
    try {
      const resp = await axios.get(
        `http://localhost:5000/api/coins/search?query=${query}`
      );
      setSearchResults(resp.data);
    } catch (err) {
      console.error("Error fetching coins:", err);
    }
  };
  const handleSearchBarFocus = () => {
    if (!isSearching) fetchTrendingCoins();
  };
  const handleSearchInputChange = (query) => {
    setIsSearching(query.length > 0);
    if (query.length > 0) fetchCoins(query);
    else fetchTrendingCoins();
  };

  // --------------------
  // Add or Grow Coin
  // --------------------
  const addCoin = (coin) => {
    setCoins((prev) => {
      const existing = prev.find((c) => c.id === coin.id);
      let updated = [...prev];
      if (existing) {
        // Ask server to increment baseSize
        axios
          .put("http://localhost:5000/api/coins/size", {
            coinId: coin.id,
            incrementSize: 10,
          })
          .then((res) => {
            console.log("Server updated coin size:", res.data);
          })
          .catch((err) => {
            console.error(err?.response?.data || err.message);
            alert(err?.response?.data?.error || "Failed to update size");
          });
      } else {
        // If new coin => create local bubble
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

        // Also ensure DB doc is created
        axios
          .put("http://localhost:5000/api/coins/size", {
            coinId: coin.id,
            incrementSize: 0,
          })
          .then((res) => {
            console.log("Created coin in DB:", res.data);
          })
          .catch((err) => {
            console.error(err?.response?.data || err.message);
          });
      }
      updated = resolveAllCollisions(updated, null);
      return updated;
    });
  };

  // --------------------
  // Bubbles
  // --------------------
  const handleBubbleClick = (coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };
  const handleDragEnd = (id, x, y) => {
    setCoins((prev) => {
      let updated = prev.map((c) => (c.id === id ? { ...c, x, y } : c));
      updated = resolveAllCollisions(updated, id);
      return updated;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {/* Pass coinAddress to Navbar */}
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
