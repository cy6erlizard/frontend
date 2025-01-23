import axios from "axios";

export const fetchCoinData = async (query) => {
  try {
    const response = await axios.get(`/api/coins/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coin data:", error);
    throw error;
  }
};
