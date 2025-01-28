import PropTypes from "prop-types";
import { useState } from "react";

// Example assets
import logo from "../assets/shill.png";
import xLogo from "../assets/x_logo.svg";
import pumpLogo from "../assets/pump_logo.png";
import gitbookLogo from "../assets/GitBook.png"; // GitBook logo asset
import dexLogo from "../assets/dex.png"; // Add your DexScreener logo asset
import githubLogo from "../assets/github.png"; // Add your GitHub logo asset

const Navbar = ({ coinAddress }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coinAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-left">
        <div
          className="navbar-logo-container"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div className="navbar-logo" style={{ cursor: "pointer" }}>
            <img
              src={logo}
              alt="Site Logo"
              style={{ maxWidth: "15%", height: "auto" }}
            />
            <a
              href="https://shill-ai.gitbook.io/shill.ai" 
              target="_blank"
              rel="noopener noreferrer"
              className="social-button"
              title="GitBook Documentation"
            >
              <img
                src={gitbookLogo}
                alt="GitBook"
                style={{ width: "24px", height: "24px" }}
              />
            </a>
          </div>
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
        {/* X button */}
        <a
          href="https://x.com/SHILLAIsolana"
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
        >
          <img src={xLogo} alt="X" className="social-logo" />
        </a>

        {/* Pump.fun button */}
        <a
          href="https://pump.fun/coin/${coinAddress}"
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
        >
          <img src={pumpLogo} alt="Pump.fun" className="social-logo" />
        </a>

        {/* DexScreener button */}
        <a
          href={`https://dexscreener.com/solana/${coinAddress}`} // Link to DexScreener for the current coin address
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
          title="View on DexScreener"
        >
          <img
            src={dexLogo}
            alt="DexScreener"
            className="social-logo"
            style={{ width: "24px", height: "24px" }}
          />
        </a>

        {/* GitHub button */}
        <a
          href="https://github.com/shillai0/-SHILL" // Replace with your GitHub repository link
          target="_blank"
          rel="noopener noreferrer"
          className="social-button"
          title="GitHub Repository"
        >
          <img
            src={githubLogo}
            alt="GitHub"
            className="social-logo"
            style={{ width: "24px", height: "24px" }}
          />
        </a>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  coinAddress: PropTypes.string.isRequired,
};

export default Navbar;
