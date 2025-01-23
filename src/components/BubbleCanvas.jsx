import { motion } from "framer-motion";
import PropTypes from "prop-types";

const BubbleCanvas = ({ bubbles, onBubbleClick }) => {
  return (
    <div className="bubble-canvas">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.name}
          className="bubble"
          style={{
            backgroundColor: bubble.color,
            width: `${bubble.size * 2}px`,
            height: `${bubble.size * 2}px`,
            position: "absolute",
            top: `${bubble.position.y}px`,
            left: `${bubble.position.x}px`,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          drag
          dragConstraints={{ top: 0, left: 0, right: 800, bottom: 600 }}
          onClick={() => onBubbleClick(bubble)}
        >
          {bubble.name}
        </motion.div>
      ))}
    </div>
  );
};

// Prop validation
BubbleCanvas.propTypes = {
  bubbles: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      }).isRequired,
    })
  ).isRequired,
  onBubbleClick: PropTypes.func.isRequired,
};

export default BubbleCanvas;
