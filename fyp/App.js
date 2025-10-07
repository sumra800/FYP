import React, { useState } from "react"
import "./App.css";
import LoginPage from "./Components/login/loginPage";
import SignupPage from "./Components/signup/signupPage";
import ProfilePage from "./Components/profile/profilePage";
import DashboardPage from "./Components/dashboard/dashboardPage";
import ProductivityPage from "./Components/productivity/productivityPage";

function App() {
  const [currentPage, setCurrentPage] = useState("login");

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
        <ProductivityPage />
      )}
    </div>
  );
}

export default App;
