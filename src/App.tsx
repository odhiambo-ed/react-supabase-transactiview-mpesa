import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import HomePage from "./pages/HomePage/HomePage";
import Payment from "./pages/Payment/Payment";
import Sidebar from "./components/Sidebar/Sidebar";
import TopNavbar from "./components/TopNavbar/TopNavbar";
import LoginPage from "./pages/Login/LoginPage";
import { useAuth } from "./contexts/AuthContext";

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={user ? <MainAppLayout /> : <Navigate to="/login" replace />}
        />
        {/* Route for handling the callback from Supabase */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
};

const MainAppLayout: React.FC = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <TopNavbar />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// AuthCallback component to handle the callback after authentication
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to dashboard after authentication
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return <div>Redirecting...</div>;
};

export default App;