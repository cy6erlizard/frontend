import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const Bubble = ({ coin, onBubbleClick, onDragEnd, canvasWidth, canvasHeight }) => {
  const [imageSize, setImageSize] = useState(coin.size * 0.5); // Initial image size (50% of bubble size)

  // Update image size when the bubble size changes
  useEffect(() => {
    setImageSize(coin.size * 0.5); // Image size is 50% of the bubble size
  }, [coin.size]);

  const handleClick = () => {
    onBubbleClick(coin);
  };

  return (
    <motion.div
      className="bubble"
      drag
      dragConstraints={{
        left: 0,
        right: canvasWidth - coin.size, // Use canvas width instead of window width
        top: 0,
        bottom: canvasHeight - coin.size, // Use canvas height instead of window height
      }}
      onDragEnd={(event, info) => {
        onDragEnd(coin.id, info.point.x, info.point.y);
      }}
      style={{
        width: coin.size,
        height: coin.size,
        backgroundColor: "rgba(255, 255, 255, 0.2)", // Transparent background
        position: "absolute",
        left: coin.x,
        top: coin.y,
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)", // Glassy effect
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", // Subtle shadow
        border: "1px solid rgba(255, 255, 255, 0.3)", // Light border for glassy effect
      }}
      onClick={handleClick}
    >
      <img
        src={coin.image}
        alt={coin.name}
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          borderRadius: "50%",
          transition: "width 0.2s ease, height 0.2s ease", // Smooth transition for image size
          pointerEvents: "none", // Disable pointer events on the image
        }}
      />
    </motion.div>
  );
};

Bubble.propTypes = {
  coin: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  onBubbleClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  canvasWidth: PropTypes.number.isRequired, // Add canvasWidth prop type
  canvasHeight: PropTypes.number.isRequired, // Add canvasHeight prop type
};

export default Bubble;