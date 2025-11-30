import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SmartLearnDashboard from "./pages/SmartLearnDashboard";
import Dashboard from "./pages/DashboardPages/Dashboard";

const App = () => {
  return (


    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/SmartLearnDashboard/*"
        element={
          <ProtectedRoute>
            <SmartLearnDashboard/>
          </ProtectedRoute>
        }
      />
      <Route path="/SmartLearnDashboard"
        element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        }
      />
      
    </Routes>

   
  );
};

export default App;













