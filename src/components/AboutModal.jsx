import Modal from "react-modal";
import PropTypes from "prop-types";
import { useEffect } from "react";
import myLogo from "../assets/SHILL1-logo.png"; // Import your logo here

const AboutModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    Modal.setAppElement("#root"); // Set the app root for accessibility
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
      closeTimeoutMS={300}
    >
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 className="modal-title">About</h2>
            <img
              src={myLogo}
              alt="Logo"
              style={{
                width: 126,
                height: 71,
                display: "block",
              }}
            />
          </div>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>
            Our platform leverages advanced artificial intelligence and data
            analytics to gather, process, and visualize real-time insights from
            the dynamic world of digital currencies. Our AI works tirelessly
            around the clock, continuously collecting and analyzing data from a
            wide range of sources, including exchanges, news outlets, and
            social media platforms. By constantly monitoring the cryptocurrency
            market, our system ensures that you always have access to the most
            accurate, up-to-date information and insights.
          </p>
          <p>
            This continuous data collection allows us to identify emerging
            trends, detect market shifts, and provide predictive analytics to
            help you stay ahead in the fast-paced world of digital currencies.
          </p>
          <p>
            We are currently in Phase 1 of our journey, laying the foundation
            for a powerful AI-driven platform designed to revolutionize how
            cryptocurrency trends are analyzed and understood. During this
            phase, our focus is on building robust data collection pipelines,
            ensuring the accuracy and reliability of the information we gather
            from diverse sources, and developing essential analytics tools to
            identify key market trends.
          </p>
        </div>
      </div>
    </Modal>
  );
};

AboutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AboutModal;
