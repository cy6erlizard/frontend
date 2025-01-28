// frontend/src/components/TutorialModal.jsx
import Modal from "react-modal";
import PropTypes from "prop-types";
import { useEffect } from "react";

const TutorialModal = ({ isOpen, onClose }) => {
  // For accessibility (once per app)
  useEffect(() => {
    Modal.setAppElement("#root");
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
          <h2 className="modal-title">Welcome to MemeCoin Bubbles!</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>
            This quick tutorial will help you get started:
          </p>
          <ul>
            <li><strong>Search</strong>: Use the search bar to find coins.</li>
            <li><strong>Add/Grow Coins</strong>: Click a search result to add a coin or grow its bubble.</li>
            <li><strong>Drag &amp; Drop</strong>: Move bubbles around the canvas to rearrange them.</li>
            <li><strong>Click a Bubble</strong>: Open the coin’s details and chart in a modal.</li>
          </ul>
          <p>
            Enjoy exploring meme coins in a fun, interactive way!
          </p>
        </div>
      </div>
    </Modal>
  );
};

TutorialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default TutorialModal;
