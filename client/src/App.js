import React, { useState, useEffect } from "react"
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./Components/landing/landingPage";
import LoginPage from "./Components/login/loginPage";
import SignupPage from "./Components/signup/signupPage";
import ProfilePage from "./Components/profile/profilePage";
import DashboardPage from "./Components/dashboard/dashboardPage";
import ProductivityPage from "./Components/productivity/productivityPage";
import CodingSpacePage from "./Components/codingSpace/codingSpacePage";

// Main App Component with Authentication Logic
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState("landing");

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
        // Keep landing page for unauthenticated users
        setCurrentPage("landing");
      }
    }
  }, [isAuthenticated, isLoading, user]);

  const navigateToLanding = () => {
    setCurrentPage("landing");
  };

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

  const navigateToCodingSpace = () => {
    setCurrentPage("coding-space");
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
      {currentPage === "landing" && (
        <LandingPage onNavigateToSignup={navigateToSignup} onNavigateToLogin={navigateToLogin} />
      )}
      {currentPage === "login" && (
        <LoginPage onNavigateToSignup={navigateToSignup} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "signup" && (
        <SignupPage onNavigateToLogin={navigateToLogin} onNavigateToProfile={navigateToProfile} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "profile" && (
        <ProfilePage onNavigateToDashboard={navigateToDashboard} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage onNavigateToProfile={navigateToProfile} onNavigateToProductivity={navigateToProductivity} onNavigateToCodingSpace={navigateToCodingSpace} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "productivity" && (
        <ProductivityPage onNavigateToDashboard={navigateToDashboard} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "coding-space" && (
        <CodingSpacePage onNavigateToDashboard={navigateToDashboard} onNavigateToLanding={navigateToLanding} />
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
