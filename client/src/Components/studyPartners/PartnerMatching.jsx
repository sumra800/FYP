import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./PartnerMatching.css";
import subjects from "../../constants/subjects";
import { partnershipAPI, partnersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import MyPartners from "./MyPartners";

const PartnerMatching = ({
  onNavigateToDashboard,
  onNavigateToMyProfile,
  onNavigateToCodingSpace,
  onNavigateToProductivity,
  onNavigateToResources,
  onNavigateToSettings,
  onNavigateToLanding,
  onNavigateToAskSenior,
}) => {
  const [subject, setSubject] = useState("");
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [filters, setFilters] = useState({
    minMatch: 65,
    hangoutIntention: "",
  });
  const { logout, user } = useAuth();
  const [connectingId, setConnectingId] = useState(null);
  const [error, setError] = useState(null);
  const [showMyPartners, setShowMyPartners] = useState(false);
  const { isAuthenticated } = useAuth();

  const hangoutOptions = ["Event", "Exam", "Coding Issue"];

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleLogout = () => {
    logout();
    onNavigateToLanding();
  };

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("");
    setError(null);
    try {
      // If user selected Event, matching isn't implemented yet
      if (filters.hangoutIntention === "Event") {
        setMatches([]);
        setStatusMessage("Event matching is not implemented yet.");
        setIsLoading(false);
        setUsingFallback(false);
        return;
      }

      const queryParams = {
        intention: filters.hangoutIntention || undefined,
        minScore: filters.minMatch,
        limit: 5,
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(
        (key) => queryParams[key] === undefined && delete queryParams[key]
      );
      if (filters.hangoutIntention === "Exam" && subject) {
        queryParams.subject = subject;
      }

      // For Coding Issue, server will sort by highest score; keep minScore filter in place

      // Fetch both matches and existing partnerships
      const [matchResponse, partnershipsResponse] = await Promise.all([
        partnershipAPI.getMatches(queryParams),
        partnersAPI.getMyPartnerships(),
      ]);

      // Get IDs of users already in active partnerships (pending or approved only; rejected/withdrawn don't count)
      const partneredUserIds = new Set();
      if (partnershipsResponse.success && partnershipsResponse.partnerships) {
        partnershipsResponse.partnerships
          .filter((p) => p.status === "pending" || p.status === "approved")
          .forEach((p) => {
            const id1 = p.user1Id?._id ?? p.user1Id;
            const id2 = p.user2Id?._id ?? p.user2Id;
            if (id1) partneredUserIds.add(String(id1));
            if (id2) partneredUserIds.add(String(id2));
          });
      }

      // Filter out matches that are already in active partnerships
      const filteredMatches = matchResponse.matches
        ? matchResponse.matches.filter(
          (match) => !partneredUserIds.has(String(match.partnerId))
        )
        : [];

      if (filteredMatches.length > 0) {
        setMatches(filteredMatches);
        setUsingFallback(false);
        setStatusMessage("");
      } else {
        setMatches([]);
        setStatusMessage(
          "No new partners found. You may already be connected with all compatible matches!"
        );
        setUsingFallback(false);
      }
    } catch (err) {
      console.error("Partner match fetch failed:", err);
      setMatches([]);
      setError(
        err.message || "Failed to fetch partners. Please try again later."
      );
      setUsingFallback(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, subject]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const matchPercent = Math.round(match.overallScore || 0);
      return matchPercent >= filters.minMatch;
    });
  }, [matches, filters]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMatches();
  };

  const handleConnect = async (match) => {
    try {
      setConnectingId(match.partnerId);
      // Map UI hangout intention to requestType expected by partnersAPI
      const requestType =
        filters.hangoutIntention === "Coding Issue"
          ? "Coding"
          : filters.hangoutIntention || "Any";

      const response = await partnershipAPI.sendRequest(
        match.partnerId.toString(),
        filters.hangoutIntention || "Any"
      );

      if (response.success) {
        // Update the match in local state to show connected status
        setMatches((prevMatches) =>
          prevMatches.map((m) =>
            m.partnerId === match.partnerId
              ? {
                ...m,
                partnershipStatus: "pending",
                partnershipId: response.partnership._id,
              }
              : m
          )
        );
        setStatusMessage(
          `Connection request sent to ${match.nickname || match.fullName}!`
        );
      }
    } catch (err) {
      console.error("Error sending connection request:", err);
      if (err.message.includes("already exists")) {
        setStatusMessage(
          `You already have a partnership request with this user.`
        );
      } else {
        setError(
          err.message || "Failed to send connection request. Please try again."
        );
      }
    } finally {
      setConnectingId(null);
    }
  };

  // Clear component state on logout to avoid showing stale data
  useEffect(() => {
    if (!isAuthenticated) {
      setMatches([]);
      setStatusMessage("");
      setShowMyPartners(false);
      setSubject("");
      setFilters({ minMatch: 65, hangoutIntention: "" });
    }
  }, [isAuthenticated]);

  return (
    <div className="study-partners-page">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#fbbf24" fill="none" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#fbbf24" stroke="#f59e0b" />
                <line x1="10" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.5" />
                <line x1="10" y1="16" x2="14" y2="16" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="logo-text">Study Buddy</span>
          </div>

          <nav className="nav-links">
            <button className="nav-link" onClick={onNavigateToDashboard}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </span>
              Dashboard
            </button>
            <button className="nav-link active" >
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </span>
              Study Partners
            </button>
            <button className="nav-link" onClick={onNavigateToCodingSpace}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </span>
              Coding Environment
            </button>
            <button className="nav-link" onClick={onNavigateToProductivity}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </span>
              Productivity Tools
            </button>
            <button className="nav-link" onClick={onNavigateToResources}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </span>
              Resources
            </button>
            <button className="nav-link my-profile-btn" onClick={onNavigateToMyProfile}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              My Profile
            </button>
            <button className="nav-link logout-link" onClick={handleLogout}>
              <span className="nav-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              Logout
            </button>
          </nav>
        </div>
      </header>
      <section className="partner-matching">
        <div className="page-container">
          <div className="partner-matching__header">
            <div>
              <p className="partner-matching__eyebrow">Study Buddy</p>
              <h1>Find Study Partners</h1>
              <p className="partner-matching__subtitle">
                Discover and connect with peers who share your study goals,
                learning style, and course interests using smart matching.
              </p>
            </div>
            <div className="partner-matching__cta">
              <button
                className="my-partners-btn"
                onClick={() => setShowMyPartners(true)}
              >
                My Partners
              </button>
            </div>
          </div>

          <div className="partner-matching__grid">
            <section className="preferences-card">
              <h2>Your Filters</h2>
              <div className="preferences-form">
                <label className="filters-range">
                  <div className="filters-range__label">
                    <span>Minimum compatibility</span>
                    <strong>{filters.minMatch}%</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={filters.minMatch}
                    onChange={(e) =>
                      handleFilterChange("minMatch", Number(e.target.value))
                    }
                  />
                </label>

                <label>
                  Hangout Intention
                  <select
                    value={filters.hangoutIntention}
                    onChange={(e) =>
                      handleFilterChange("hangoutIntention", e.target.value)
                    }
                  >
                    <option value="">All Intentions</option>
                    {hangoutOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                {filters.hangoutIntention === "Exam" && (
                  <div style={{ marginTop: 8 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Subject</span>
                      <input
                        list="subjects-list"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Select or type subject"
                        style={{ padding: '0.6rem', borderRadius: 8, border: `1px solid var(--border-color)`, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      />
                      <datalist id="subjects-list">
                        {subjects.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </label>
                  </div>
                )}

                <div className="preferences-card__summary">
                  <div>
                    <p className="summary-label">Current Filter</p>
                    <p className="summary-value">
                      {filters.hangoutIntention || "Any intention"}
                    </p>
                  </div>
                  <div>
                    <p className="summary-label">Matches Found</p>
                    <p className="summary-value">{filteredMatches.length}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="find-matches-btn"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Find Matches"}
              </button>
            </section>

            <section className="matches-card">
              <div className="matches-card__header">
                <div>
                  <div className="matches-card__title-row">
                    <h2>Your Matches</h2>
                  </div>
                  <p>
                    {filteredMatches.length} results · Showing{" "}
                    {filters.minMatch}%+ compatibility
                  </p>
                </div>
                <button
                  type="button"
                  className="filters-btn"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? "Syncing..." : "Refresh"}
                </button>
              </div>

              {isLoading ? (
                <div className="matches-loading">
                  <div className="loading-spinner" />
                  <p>Finding your perfect study partners...</p>
                </div>
              ) : error ? (
                <div className="matches-error">
                  <p>{error}</p>
                  <button
                    type="button"
                    className="filters-btn"
                    onClick={handleRefresh}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {statusMessage && (
                    <div className="status-banner" role="status">
                      {statusMessage}
                    </div>
                  )}
                  {filteredMatches.length === 0 ? (
                    <div className="empty-state">
                      <h3>No matches yet</h3>
                      <p>
                        Try lowering the compatibility threshold or changing your
                        filters.
                      </p>
                      <button
                        type="button"
                        className="filters-btn"
                        onClick={() => handleFilterChange("minMatch", 50)}
                      >
                        Lower to 50%
                      </button>
                    </div>
                  ) : (
                    <ul className="matches-list">
                      {filteredMatches.slice(0, 5).map((match) => (
                        <li key={match.partnerId} className="match-card">
                          <div className="match-card__score">
                            <span>{Math.round(match.overallScore)}%</span>
                            <small>match</small>
                          </div>
                          <div className="match-card__profile">
                            <div className="match-card__name-row">
                              <h3>{match.nickname || match.fullName}</h3>
                              <span className="year-pill">
                                {match.departmentName}
                              </span>
                            </div>
                            <p className="match-card__meta">
                              {match.universityName}
                            </p>
                            <div className="match-card__courses">
                              {(match.partnerProfile?.primaryCourses || [])
                                .length ? (
                                match.partnerProfile.primaryCourses
                                  .slice(0, 3)
                                  .map((course) => (
                                    <span
                                      key={course}
                                      className="badge course-badge"
                                    >
                                      {course}
                                    </span>
                                  ))
                              ) : (
                                <span className="badge badge-muted">
                                  No courses shared
                                </span>
                              )}
                            </div>
                            {match.sharedCourses?.length > 0 && (
                              <p className="match-card__shared">
                                Shared courses:{" "}
                                <strong>{match.sharedCourses.join(", ")}</strong>
                              </p>
                            )}
                            {match.sharedTimes?.length > 0 && (
                              <p className="match-card__shared">
                                Study times:{" "}
                                <strong>{match.sharedTimes.join(", ")}</strong>
                              </p>
                            )}
                            <p className="match-card__shared">
                              Learning style:{" "}
                              <strong>
                                {match.partnerProfile?.preferredLearningStyle?.replace(
                                  "-",
                                  " "
                                ) || "Any"}
                              </strong>
                            </p>
                          </div>
                          <div className="match-card__actions">
                            {match.partnershipStatus === "pending" ? (
                              <button
                                className="connect-btn"
                                disabled
                                title="Connection request pending"
                              >
                                Pending
                              </button>
                            ) : match.partnershipStatus === "connected" ? (
                              <button
                                className="connect-btn connected"
                                disabled
                                title="Already connected"
                              >
                                Connected
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="connect-btn"
                                onClick={() => handleConnect(match)}
                                disabled={connectingId === match.partnerId}
                              >
                                {connectingId === match.partnerId
                                  ? "Connecting..."
                                  : "Connect"}
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </section>

      {showMyPartners && (
        <MyPartners
          onClose={() => setShowMyPartners(false)}
          onPartnershipChange={(partnershipId, action) => {
            if (action === "withdraw") {
              // Update the match to not_connected so the Connect button reappears
              setMatches((prevMatches) =>
                prevMatches.map((m) =>
                  m.partnershipId === partnershipId
                    ? { ...m, partnershipStatus: "not_connected", partnershipId: null }
                    : m
                )
              );
            }
          }}
        />
      )}
    </div>
  );
};

export default PartnerMatching;