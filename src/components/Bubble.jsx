import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const Bubble = ({ coin, onBubbleClick, onDragEnd, canvasWidth, canvasHeight }) => {
  const [imageSize, setImageSize] = useState(coin.size * 0.5); // Initial image size (50% of bubble size)
  console.log(canvasWidth, canvasHeight);

  // Update image size when the bubble size changes
  useEffect(() => {
    setImageSize(coin.size * 0.5); // Image size is 50% of the bubble size
  }, [coin.size]);

  const handleDoubleClick = () => {
    onBubbleClick(coin);
  };

  return (
    <motion.div
      className="bubble"
      drag
      dragConstraints={{
        left: 0,
        right: 0, // Constrain right edge to canvas width minus bubble size
        top: 0,
        bottom: 0, // Constrain bottom edge to canvas height minus bubble size
      }}
      onDragEnd={(event, info) => {
        // Ensure the bubble stays within the canvas bounds
        let newX = info.point.x;
        let newY = info.point.y;

        // Snap to the nearest border if the bubble goes out of the canvas
        if (newX < 0) newX = 0; // Snap to left border
        if (newX > canvasWidth - coin.size) newX = canvasWidth - coin.size; // Snap to right border
        if (newY < 0) newY = 0; // Snap to top border
        if (newY > canvasHeight - coin.size) newY = canvasHeight - coin.size; // Snap to bottom border
        console.log(newX, newY);
        onDragEnd(coin.id, newX, newY);
      }}
      style={{
        width: coin.size,
        height: coin.size,
        backgroundColor: "rgba(255, 255, 255, 0.2)", // Transparent background
        position: "absolute",
        left: Math.max(0, Math.min(coin.x, canvasWidth - coin.size)), // Ensure initial position is within bounds
        top: Math.max(0, Math.min(coin.y, canvasHeight - coin.size)), // Ensure initial position is within bounds
        borderRadius: "50%",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)", // Glassy effect
        boxShadow: "0 20px 30px rgba(0, 0, 0, 0.03), inset 0px 10px 30px 5px rgba(255, 255, 255, 0.1)", // Bubble shadow
        border: "1px solid rgba(255, 255, 255, 0.3)", // Light border for glassy effect
      }}
      onDoubleClick={handleDoubleClick} // Use onDoubleClick instead of onClick
    >
      <div
        style={{
          position: "absolute",
          width: "90%",
          height: "90%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.06) 0%, rgba(255,255,255,0) 70%)", // Inner glow
          boxShadow: "inset 0 20px 30px rgba(255, 255, 255, 0.3)", // Inner shadow
        }}
      />
      <img
        src={coin.image}
        alt={coin.name}
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          borderRadius: "50%",
          // transition: "width 0.2s ease, height 0.2s ease", // Smooth transition for image size
          pointerEvents: "none", // Disable pointer events on the image
          zIndex: 1, // Ensure the image is above the inner glow
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