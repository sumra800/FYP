import React, { useState } from "react"
import "./App.css";
import LandingPage from "./src/Components/landing/landingPage";
import LoginPage from "./src/Components/login/loginPage";
import SignupPage from "./src/Components/signup/signupPage";
import ProfilePage from "./src/Components/profile/profilePage";
import DashboardPage from "./src/Components/dashboard/dashboardPage";
import ProductivityPage from "./src/Components/productivity/productivityPage";

function App() {
  const [currentPage, setCurrentPage] = useState("landing");

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
        <ProfilePage onNavigateToDashboard={navigateToDashboard} />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage onNavigateToProfile={navigateToProfile} onNavigateToProductivity={navigateToProductivity} />
      )}
      {currentPage === "productivity" && (
        <ProductivityPage />
      )}
    </div>
  );
}

export default App;
