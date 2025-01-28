// frontend/src/components/Navbar.jsx
import PropTypes from "prop-types";
import { useState } from "react";
import AboutModal from "./AboutModal";

// Example assets
import logo from "../assets/shill.png";
import xLogo from "../assets/x_logo.svg";
import pumpLogo from "../assets/pump_logo.png";

const Navbar = ({ coinAddress }) => {
  const [copied, setCopied] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const openAboutModal = () => setIsAboutModalOpen(true);
  const closeAboutModal = () => setIsAboutModalOpen(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coinAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <>
      <nav className="navbar-modern">
        <div className="navbar-left">
          <div className="navbar-logo" onClick={openAboutModal} style={{ cursor: "pointer" }}>
            <img src={logo} alt="Site Logo" style={{ maxWidth: "15%", height: "auto" }} />
          </div>

          {/* Display the coinAddress placeholder */}
          <div className="navbar-address">
            <span className="address-text">{coinAddress}</span>
            <span
              className="copy-button"
              role="button"
              title="Copy Address"
              onClick={copyToClipboard}
            >
              {copied ? "✔" : "📋"}
            </span>
          </div>
        </div>

        <div className="navbar-right">
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-button">
            <img src={xLogo} alt="X" className="social-logo" />
          </a>
          <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="social-button">
            <img src={pumpLogo} alt="Pump.fun" className="social-logo" />
          </a>
        </div>
      </nav>

      <AboutModal isOpen={isAboutModalOpen} onClose={closeAboutModal} />
    </>
  );
};

Navbar.propTypes = {
  coinAddress: PropTypes.string.isRequired,
};

export default Navbar;
