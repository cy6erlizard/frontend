import PropTypes from "prop-types";
import { useState } from "react";
import AboutModal from "./AboutModal";

import logo from "../assets/shill.png"
import X from "../assets/X_logo.svg"
import pump from "../assets/pump_logo.png"

const Navbar = ({ coinAddress }) => {
  const [copied, setCopied] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const openAboutModal = () => setIsAboutModalOpen(true);
  const closeAboutModal = () => setIsAboutModalOpen(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coinAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000); // Reset copied state after 1 second
  };
  return (
    <>
    <nav className="navbar-modern">
      {/* Left Section: Logo and Coin Address */}
      <div className="navbar-left">
        {/* Logo (PNG instead of SVG) */}
        <div className="navbar-logo" onClick={openAboutModal} style={{ cursor: "pointer" }}>
          <img
            src={logo}  
            alt="Site Logo"
            style={{ maxWidth: "14%", height: "auto" }}
          />
          
        </div>

        {/* Coin Address */}
          {/* Coin Address */}
          <div className="navbar-address">
          <span className="address-text">{coinAddress}</span>
          <span
            className="copy-button"
            role="button"
            title="Copy Address"
            onClick={copyToClipboard}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
              cursor: "pointer",
            }}
          >
            {copied ? (
              <span
                style={{
                  fontSize: "16px",
                  color: "green",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✔
              </span>
            ) : (
              <span
                style={{
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.8)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📋
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Right Section: Social Buttons */}
      <div className="navbar-right">
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
        >
          <img
            src={X} 
            alt="X"
            className="social-logo"
          />
        </a>
        <a
          href="https://pump.fun/coin/8USoBYy9SEPs65M1XcKMPJApXw5KZS8mc3wGjbS9Nb45"
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
        >
          <img
            src={pump}
            alt="Pump.fun"
            className="social-logo"
          />
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
