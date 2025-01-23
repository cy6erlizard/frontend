import { useEffect, useState } from "react";
import Bubble from "./Bubble";
import PropTypes from "prop-types";

const Canvas = ({ coins, onBubbleClick, onDragEnd }) => {
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Get the canvas dimensions
  useEffect(() => {
    const canvas = document.querySelector(".canvas");
    if (canvas) {
      setCanvasDimensions({
        width: canvas.clientWidth,
        height: canvas.clientHeight,
      });
    }

    // Update dimensions on window resize
    const handleResize = () => {
      setCanvasDimensions({
        width: canvas.clientWidth,
        height: canvas.clientHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="canvas">
      {coins.map((coin) => (
        <Bubble
          key={coin.id}
          coin={coin}
          onBubbleClick={onBubbleClick}
          onDragEnd={onDragEnd}
          canvasWidth={canvasDimensions.width}
          canvasHeight={canvasDimensions.height}
        />
      ))}
    </div>
  );
};

Canvas.propTypes = {
  coins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
  onBubbleClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default Canvas;