import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import PaymentForm from "./components/PaymentForm";
import SuccessPage from "./components/SuccessPage";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import UserManagement from "./components/UserManagement"; // ✅ Add this import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/payment" element={<PaymentForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-management" element={<UserManagement />} /> {/* ✅ Add this */}
      </Routes>
    </Router>
  );
}

export default App;