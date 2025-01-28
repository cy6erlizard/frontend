// frontend/src/components/Canvas.jsx
import { useEffect, useState } from "react";
import Bubble from "./Bubble";
import PropTypes from "prop-types";

const FILL_RATIO = 0.5;

function computeScaleFactor(canvasWidth, canvasHeight, coins) {
  let sumSquare = 0;
  for (const c of coins) {
    sumSquare += c.baseSize * c.baseSize;
  }
  if (!sumSquare || !coins.length) return 1;

  const area = canvasWidth * canvasHeight;
  // formula => k <= sqrt( (4 * fillRatio * area) / (π * sumSquare) )
  const numerator = 4 * FILL_RATIO * area;
  const denominator = Math.PI * sumSquare;
  const k = Math.sqrt(numerator / denominator);
  return Math.min(k, 1);
}

const Canvas = ({ coins, onBubbleClick, onDragEnd }) => {
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvasElem = document.querySelector(".canvas");
    if (canvasElem) {
      setDims({ width: canvasElem.clientWidth, height: canvasElem.clientHeight });
    }

    const handleResize = () => {
      if (canvasElem) {
        setDims({ width: canvasElem.clientWidth, height: canvasElem.clientHeight });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scaleFactor = computeScaleFactor(dims.width, dims.height, coins);

  return (
    <>
      {coins.map((coin) => {
        const scaledSize = coin.baseSize * scaleFactor;
        const scaledCoin = { ...coin, size: scaledSize };
        return (
          <Bubble
            key={coin.id}
            coin={scaledCoin}
            canvasWidth={dims.width}
            canvasHeight={dims.height}
            onBubbleClick={onBubbleClick}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </>
  );
};

Canvas.propTypes = {
  coins: PropTypes.array.isRequired,
  onBubbleClick: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default Canvas;
