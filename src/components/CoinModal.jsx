import { useRef, useEffect, useState } from "react";
import Modal from "react-modal";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CoinModal = ({ coin, isOpen, onClose }) => {
  const chartRef = useRef(null); // Ref to store the chart instance
  const [historicalData, setHistoricalData] = useState(null); // State to store historical data
  const [lastPrice, setLastPrice] = useState(null); // State to store the last price
  const [marketCap, setMarketCap] = useState(null); // State to store the market cap
  const [loading, setLoading] = useState(true); // State to track loading status

  // Fetch historical data and market cap for the coin
  useEffect(() => {
    if (isOpen && coin) {
      const fetchData = async () => {
        try {
          // Fetch historical price data
          const priceResponse = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`,
            {
              params: {
                vs_currency: "usd",
                days: "7", // Fetch data for the last 7 days
              },
            }
          );

          // Extract prices and timestamps from the response
          const prices = priceResponse.data.prices;
          const labels = prices.map((price) =>
            new Date(price[0]).toLocaleDateString()
          );
          const data = prices.map((price) => price[1]);

          // Set the last price
          const lastPrice = data[data.length - 1];
          setLastPrice(lastPrice);

          // Fetch market cap data
          const marketCapResponse = await axios.get(
            `https://api.coingecko.com/api/v3/coins/markets`,
            {
              params: {
                vs_currency: "usd",
                ids: coin.id,
              },
            }
          );

          // Set the market cap
          const marketCap = marketCapResponse.data[0]?.market_cap || null;
          setMarketCap(marketCap);

          // Set historical data for the chart
          setHistoricalData({ labels, data });
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, coin]);

  // Destroy the chart when the modal closes
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Chart data
  const chartData = {
    labels: historicalData ? historicalData.labels : [],
    datasets: [
      {
        label: "Price (USD)",
        data: historicalData ? historicalData.data : [],
        borderColor: "#6366f1", // Modern indigo color
        fill: false,
        tension: 0.4, // Smooth line curve
      },
    ],
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
      closeTimeoutMS={300} // Smooth transition for closing
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{coin.name}</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <img
            src={coin.image}
            alt={coin.name}
            className="coin-image"
          />
          <div className="coin-details">
            <p className="coin-price">
              <span className="label">Price:</span>{" "}
              <span className="value">
                ${lastPrice ? lastPrice.toFixed(2) : "Loading..."}
              </span>
            </p>
            <p className="coin-market-cap">
              <span className="label">Market Cap:</span>{" "}
              <span className="value">
                ${marketCap ? marketCap.toLocaleString() : "Loading..."}
              </span>
            </p>
          </div>
          {loading ? (
            <p className="loading-text">Loading chart...</p>
          ) : (
            <div className="chart-container">
              <Line
                ref={chartRef}
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#6b7280", // Gray color for ticks
                      },
                    },
                    y: {
                      grid: {
                        color: "#e5e7eb", // Light gray grid lines
                      },
                      ticks: {
                        color: "#6b7280", // Gray color for ticks
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false, // Hide legend
                    },
                    title: {
                      display: false, // Hide title
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

CoinModal.propTypes = {
  coin: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    marketCap: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CoinModal;