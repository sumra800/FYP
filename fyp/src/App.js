import React, { useState, useEffect } from "react"
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./Components/login/loginPage";
import SignupPage from "./Components/signup/signupPage";
import ProfilePage from "./Components/profile/profilePage";
import DashboardPage from "./Components/dashboard/dashboardPage";
import ProductivityPage from "./Components/productivity/productivityPage";

// Main App Component with Authentication Logic
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState("login");

  // Update current page based on authentication status
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Check if user has completed profile setup
        if (user && (!user.nickname || !user.currentSemester || !user.studyPersona)) {
          setCurrentPage("profile");
        } else {
          setCurrentPage("dashboard");
        }
      } else {
        setCurrentPage("login");
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const navigateToSignup = () => {
    setCurrentPage("signup");
  };

  const navigateToLogin = () => {
    setCurrentPage("login");
  };

  const navigateToProfile = () => {
    setCurrentPage("profile");
  };

  const navigateToDashboard = () => {
    setCurrentPage("dashboard");
  };

  const navigateToProductivity = () => {
    setCurrentPage("productivity");
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {currentPage === "login" && (
        <LoginPage onNavigateToSignup={navigateToSignup} />
      )}
      {currentPage === "signup" && (
        <SignupPage onNavigateToLogin={navigateToLogin} onNavigateToProfile={navigateToProfile} />
      )}
      {currentPage === "profile" && (
        <ProfilePage onNavigateToDashboard={navigateToDashboard} />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage onNavigateToProfile={navigateToProfile} onNavigateToProductivity={navigateToProductivity} />
      )}
      {currentPage === "productivity" && (
        <ProductivityPage onNavigateToDashboard={navigateToDashboard} />
      )}
    </div>
  );
};

// Root App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
