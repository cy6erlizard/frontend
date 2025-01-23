import { motion } from "framer-motion";
import PropTypes from "prop-types";

const CoinDetailsModal = ({ coin, onClose }) => {
  if (!coin) return null;

  return (
    <motion.div
      className="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h2>
          {coin.name} ({coin.symbol})
        </h2>
        <p>Price: ${coin.price}</p>
        <p>Volume: {coin.volume}</p>
        <button onClick={onClose}>Close</button>
      </motion.div>
    </motion.div>
  );
};

CoinDetailsModal.propTypes = {
  coin: PropTypes.shape({
    name: PropTypes.string.isRequired,
    symbol: PropTypes.string,
    price: PropTypes.number,
    volume: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
};

export default CoinDetailsModal;
