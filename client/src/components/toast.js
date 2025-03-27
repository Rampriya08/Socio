import { toast } from "react-hot-toast";

const showToast = (type, message) => {
  const toastStyles = {
    success: {
      background: "#28a745",
      color: "white",
      borderRadius: "10px",
      padding: "5px",
      fontSize: "16px",
      fontWeight: "bold",
    },
    error: {
      background: "#dc3545",
      color: "white",
      borderRadius: "10px",
      padding: "5px",
      fontSize: "16px",
      fontWeight: "bold",
    },
    info: {
      background: "#007bff",
      color: "white",
      borderRadius: "10px",
      padding: "5px",
      fontSize: "16px",
      fontWeight: "bold",
      
    },
  };

  toast[type](message, {
    style: toastStyles[type] || toastStyles.info,
    position: "top-center",
    duration: 3000,
  });
};

export default showToast;
