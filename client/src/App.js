import React, { useState, useEffect } from "react"
import "./App.css";
import "./styles/theme.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./Components/landing/landingPage";
import LoginPage from "./Components/login/loginPage";
import SignupPage from "./Components/signup/signupPage";
import ProfilePage from "./Components/profile/profilePage";
import DashboardPage from "./Components/dashboard/dashboardPage";
import ProductivityPage from "./Components/productivity/productivityPage";
import CodingSpacePage from "./Components/codingSpace/codingSpacePage";
import SettingsPage from "./Components/settings/settingsPage";
import ResourcesPage from "./Components/resources/resourcesPage";

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

  const navigateToSettings = () => {
    setCurrentPage("settings");
  };

  const navigateToResources = () => {
    setCurrentPage("resources");
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
        <ProfilePage
          onNavigateToDashboard={navigateToDashboard}
          onNavigateToCodingSpace={navigateToCodingSpace}
          onNavigateToProductivity={navigateToProductivity}
          onNavigateToResources={navigateToResources}
          onNavigateToLanding={navigateToLanding}
        />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage onNavigateToProfile={navigateToProfile} onNavigateToProductivity={navigateToProductivity} onNavigateToCodingSpace={navigateToCodingSpace} onNavigateToSettings={navigateToSettings} onNavigateToResources={navigateToResources} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "productivity" && (
        <ProductivityPage onNavigateToDashboard={navigateToDashboard} onNavigateToCodingSpace={navigateToCodingSpace} onNavigateToResources={navigateToResources} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "coding-space" && (
        <CodingSpacePage onNavigateToDashboard={navigateToDashboard} onNavigateToProductivity={navigateToProductivity} onNavigateToResources={navigateToResources} onNavigateToLanding={navigateToLanding} />
      )}
      {currentPage === "settings" && (
        <SettingsPage
          onNavigateToDashboard={navigateToDashboard}
          onNavigateToProfile={navigateToProfile}
          onNavigateToCodingSpace={navigateToCodingSpace}
          onNavigateToProductivity={navigateToProductivity}
          onNavigateToResources={navigateToResources}
          onNavigateToLanding={navigateToLanding}
        />
      )}
      {currentPage === "resources" && (
        <ResourcesPage onNavigateToDashboard={navigateToDashboard} onNavigateToCodingSpace={navigateToCodingSpace} onNavigateToProductivity={navigateToProductivity} onNavigateToLanding={navigateToLanding} />
      )}
    </div>
  );
};

// Root App Component with AuthProvider and ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
