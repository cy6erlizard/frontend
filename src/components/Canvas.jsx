import { useEffect, useState } from "react";
import Bubble from "./Bubble";
import PropTypes from "prop-types";

// For a fraction of the canvas area we want to fill
const FILL_RATIO = 0.5; // 50% of canvas area, for example

function computeScaleFactor(canvasWidth, canvasHeight, coins) {
  // 1) Sum of all (baseSize^2)
  let sumSizeSquared = 0;
  for (const c of coins) {
    sumSizeSquared += c.baseSize * c.baseSize;
  }

  // If no coins or sumSizeSquared=0, trivial factor
  if (sumSizeSquared === 0 || coins.length === 0) {
    return 1;
  }

  // 2) Canvas area * fill ratio
  const canvasArea = canvasWidth * canvasHeight;
  // We want sum of areas <= fillRatio * canvasArea
  // Each bubble's area ~ π/4 * (size^2)
  // => k^2 * sum(baseSize^2) * (π/4) <= fillRatio * (width*height)
  // => k <= sqrt( (4 * fillRatio * width * height) / (π * sum(baseSize^2)) )

  const numerator = 4 * FILL_RATIO * canvasArea;
  const denominator = Math.PI * sumSizeSquared;
  const k = Math.sqrt(numerator / denominator);

  // Optionally clamp to 1, so we never enlarge beyond the base size:
  // (If you'd like them to grow to fill space, remove the clamp.)
  return Math.min(k, 1);
}

const Canvas = ({ coins, onBubbleClick, onDragEnd }) => {
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvasElem = document.querySelector(".canvas");
    if (canvasElem) {
      setCanvasDimensions({
        width: canvasElem.clientWidth,
        height: canvasElem.clientHeight,
      });
    }

    const handleResize = () => {
      if (canvasElem) {
        setCanvasDimensions({
          width: canvasElem.clientWidth,
          height: canvasElem.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute scale factor each render
  const { width, height } = canvasDimensions;
  const scaleFactor = computeScaleFactor(width, height, coins);

  return (
    <div className="canvas">
      {coins.map((coin) => {
        // We'll scale the coin's diameter for display
        const scaledSize = coin.baseSize * scaleFactor;

        // We pass the scaled size to <Bubble> for actual rendering
        // BUT we keep coin.x, coin.y for positions
        const scaledCoin = {
          ...coin,
          size: scaledSize, 
        };

        return (
          <Bubble
            key={coin.id}
            coin={scaledCoin}
            onBubbleClick={onBubbleClick}
            onDragEnd={onDragEnd}
            canvasWidth={width}
            canvasHeight={height}
          />
        );
      })}
    </div>
  );
};

Canvas.propTypes = {
  coins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      baseSize: PropTypes.number.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      // ... any other props like name, image, etc.
    })
  ).isRequired,
  onBubbleClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default Canvas;
