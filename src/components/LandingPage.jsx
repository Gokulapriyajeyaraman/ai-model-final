import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <button className="bank-button" onClick={() => navigate("/admin-login")}>
        The Bank
      </button>
      <button className="center-button" onClick={() => navigate("/payment")}>
        Make a Payment
      </button>
    </div>
  );
}

export default LandingPage;
