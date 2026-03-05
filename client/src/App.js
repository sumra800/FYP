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
import MyProfilePage from "./Components/myProfile/myProfilePage";
import AboutPage from "./Components/about/aboutPage";
import ContactPage from "./Components/contact/contactPage";
import FeaturesPage from "./Components/features/featuresPage";
import PartnerMatchingPage from "./Components/studyPartners/PartnerMatching";
import Footer from "./Components/common/Footer";
import EducationalBot from "./Components/common/EducationalBot";

// Main App Component with Authentication Logic
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState("landing");
  const [history, setHistory] = useState([]);

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

  const changePage = (page) => {
    if (currentPage !== page) {
      setHistory(prev => [...prev, currentPage]);
      setCurrentPage(page);
    }
  };

  const navigateBack = () => {
    setHistory(prev => {
      if (prev.length === 0) {
        setCurrentPage("landing");
        return prev;
      }
      const newHistory = [...prev];
      const lastPage = newHistory.pop();
      setCurrentPage(lastPage);
      return newHistory;
    });
  };

  const navigateToLanding = () => { changePage("landing"); };
  const navigateToSignup = () => { changePage("signup"); };
  const navigateToLogin = () => { changePage("login"); };
  const navigateToProfile = () => { changePage("profile"); };
  const navigateToMyProfile = () => { changePage("my-profile"); };
  const navigateToDashboard = () => { changePage("dashboard"); };
  const navigateToProductivity = () => { changePage("productivity"); };
  const navigateToCodingSpace = () => { changePage("coding-space"); };
  const navigateToSettings = () => { changePage("settings"); };
  const navigateToResources = () => { changePage("resources"); };
  const navigateToAbout = () => { changePage("about"); };
  const navigateToContact = () => { changePage("contact"); };
  const navigateToFeatures = () => { changePage("features"); };
  const navigateToStudyPartners = () => { changePage("study-partners"); };

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
        <LandingPage
          onNavigateToSignup={navigateToSignup}
          onNavigateToLogin={navigateToLogin}
          onNavigateToAbout={navigateToAbout}
          onNavigateToContact={navigateToContact}
          onNavigateToFeatures={navigateToFeatures}
        />
      )}
      {currentPage === "login" && (
        <LoginPage
          onNavigateToSignup={navigateToSignup}
          onNavigateToLanding={navigateToLanding}
          onNavigateToAbout={navigateToAbout}
          onNavigateToContact={navigateToContact}
          onNavigateToFeatures={navigateToFeatures}
        />
      )}
      {currentPage === "signup" && (
        <SignupPage
          onNavigateToLogin={navigateToLogin}
          onNavigateToProfile={navigateToProfile}
          onNavigateToLanding={navigateToLanding}
          onNavigateToAbout={navigateToAbout}
          onNavigateToContact={navigateToContact}
          onNavigateToFeatures={navigateToFeatures}
        />
      )}
      {currentPage === "about" && (
        <AboutPage onNavigateToLanding={navigateToLanding} onNavigateBack={navigateBack} />
      )}
      {currentPage === "contacts" && (
        <ContactPage onNavigateToLanding={navigateToLanding} onNavigateBack={navigateBack} />
      )}
      {currentPage === "contact" && (
        <ContactPage onNavigateToLanding={navigateToLanding} onNavigateBack={navigateBack} />
      )}
      {currentPage === "features" && (
        <FeaturesPage onNavigateToLanding={navigateToLanding} onNavigateBack={navigateBack} />
      )}
      {currentPage === "study-partners" && (
        <PartnerMatchingPage
          onNavigateToDashboard={navigateToDashboard}
          onNavigateToProfile={navigateToProfile}
          onNavigateToCodingSpace={navigateToCodingSpace}
          onNavigateToProductivity={navigateToProductivity}
          onNavigateToResources={navigateToResources}
          onNavigateToSettings={navigateToSettings}
          onNavigateToLanding={navigateToLanding}
          onNavigateToAskSenior={() => { }}
          onNavigateToMyProfile={navigateToMyProfile}
        />
      )}
      {currentPage === "profile" && (
        <ProfilePage
          onNavigateToDashboard={navigateToDashboard}
          onNavigateToCodingSpace={navigateToCodingSpace}
          onNavigateToProductivity={navigateToProductivity}
          onNavigateToResources={navigateToResources}
          onNavigateToLanding={navigateToLanding}
          onNavigateToStudyPartners={navigateToStudyPartners}
          onNavigateToMyProfile={navigateToMyProfile}
        />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage onNavigateToProfile={navigateToProfile} onNavigateToProductivity={navigateToProductivity} onNavigateToCodingSpace={navigateToCodingSpace} onNavigateToSettings={navigateToSettings} onNavigateToResources={navigateToResources} onNavigateToLanding={navigateToLanding} onNavigateToStudyPartners={navigateToStudyPartners} onNavigateToMyProfile={navigateToMyProfile} />
      )}
      {currentPage === "productivity" && (
        <ProductivityPage onNavigateToDashboard={navigateToDashboard} onNavigateToCodingSpace={navigateToCodingSpace} onNavigateToResources={navigateToResources} onNavigateToLanding={navigateToLanding} onNavigateToStudyPartners={navigateToStudyPartners} onNavigateToMyProfile={navigateToMyProfile} />
      )}
      {currentPage === "coding-space" && (
        <CodingSpacePage onNavigateToDashboard={navigateToDashboard} onNavigateToProductivity={navigateToProductivity} onNavigateToResources={navigateToResources} onNavigateToLanding={navigateToLanding} onNavigateToStudyPartners={navigateToStudyPartners} onNavigateToMyProfile={navigateToMyProfile} />
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
      {currentPage === "my-profile" && (
        <MyProfilePage
          onNavigateToCustomizeProfile={navigateToProfile}
          onNavigateToDashboard={navigateToDashboard}
          onNavigateToCodingSpace={navigateToCodingSpace}
          onNavigateToProductivity={navigateToProductivity}
          onNavigateToResources={navigateToResources}
          onNavigateToLanding={navigateToLanding}
          onNavigateToStudyPartners={navigateToStudyPartners}
        />
      )}
      {currentPage === "resources" && (
        <ResourcesPage onNavigateToDashboard={navigateToDashboard} onNavigateToCodingSpace={navigateToCodingSpace} onNavigateToProductivity={navigateToProductivity} onNavigateToLanding={navigateToLanding} onNavigateToStudyPartners={navigateToStudyPartners} onNavigateToMyProfile={navigateToMyProfile} />
      )}

      {/* global footer on all pages except landing, login, signup */}
      {!["landing", "login", "signup"].includes(currentPage) && (
        <Footer
          onNavigateToAbout={navigateToAbout}
          onNavigateToFeatures={navigateToFeatures}
          onNavigateToContact={navigateToContact}
          onNavigateToLanding={navigateToLanding}
        />
      )}

      {/* Educational Bot - Available on all authenticated pages */}
      {!["landing", "login", "signup"].includes(currentPage) && (
        <EducationalBot />
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
