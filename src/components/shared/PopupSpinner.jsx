import "../../styles/popup-spinner.css";

const PopupSpinner = ({ isVisible, message = "Yönlendiriliyorsunuz..." }) => {
  if (!isVisible) return null;

  return (
    <div className="popup-spinner-overlay">
      <div className="popup-spinner-card">
        {/* Spinner */}
        <div className="popup-spinner-icon"></div>

        {/* Message */}
        <p className="popup-spinner-text">{message}</p>
      </div>
    </div>
  );
};

export default PopupSpinner;
