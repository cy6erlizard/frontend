import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

/**
 * Bubble is rendered at coin.x / coin.y
 * but size is scaled dynamically (coin.size).
 */
const Bubble = ({ coin, onBubbleClick, onDragEnd, canvasWidth, canvasHeight }) => {
  // We keep the image scaled to half the bubble’s diameter
  const [imageSize, setImageSize] = useState(coin.size * 0.5);

  useEffect(() => {
    setImageSize(coin.size * 0.5);
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
        right: 0,
        top: 0,
        bottom: 0,
      }}
      dragMomentum={false}
      dragElastic={1}
      transition={{ duration: 0 }}

      onDragEnd={(event, info) => {
        // Let's clamp final position so bubble doesn't go off-canvas
        let newX = info.point.x;
        let newY = info.point.y;

        if (newX < 0) newX = 0;
        if (newX > canvasWidth - coin.size) newX = canvasWidth - coin.size;
        if (newY < 0) newY = 0;
        if (newY > canvasHeight - coin.size) newY = canvasHeight - coin.size;

        // Pass final position to parent
        onDragEnd(coin.id, newX, newY);
      }}
      style={{
        position: "absolute",
        left: Math.max(0, Math.min(coin.x, canvasWidth - coin.size)),
        top: Math.max(0, Math.min(coin.y, canvasHeight - coin.size)),
        width: coin.size,
        height: coin.size,
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
        boxShadow:
          "0 20px 30px rgba(0, 0, 0, 0.03), inset 0px 10px 30px 5px rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          position: "absolute",
          width: "90%",
          height: "90%",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.06) 0%, rgba(255,255,255,0) 70%)",
          boxShadow: "inset 0 20px 30px rgba(255, 255, 255, 0.3)",
        }}
      />
      <img
        src={coin.image}
        alt={coin.name}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </motion.div>
  );
};

Bubble.propTypes = {
  coin: PropTypes.shape({
    id: PropTypes.string.isRequired,
    baseSize: PropTypes.number, // Our custom "base size"
    size: PropTypes.number.isRequired, // The scaled size (passed in from Canvas)
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,

  }).isRequired,
  onBubbleClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  canvasWidth: PropTypes.number.isRequired,
  canvasHeight: PropTypes.number.isRequired,
};

export default Bubble;
