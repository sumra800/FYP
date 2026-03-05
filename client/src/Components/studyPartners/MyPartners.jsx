import React, { useEffect, useState } from "react";
import "./myPartners.css";
import { partnersAPI } from "../../services/api";

const MyPartners = ({ onClose, onPartnershipChange }) => {
  const [partnerships, setPartnerships] = useState([]);
  const [approvedPartners, setApprovedPartners] = useState([]);
  const [activeTab, setActiveTab] = useState("approved"); // "approved" | "pending" | "sent"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // Helper function to construct proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:7000${imagePath}`;
  };

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const fetchPartnerships = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch approved partners
      const approvedRes = await partnersAPI.getApprovedPartners();
      if (approvedRes.success) {
        setApprovedPartners(approvedRes.partners || []);
      }

      // Fetch all partnerships (pending + approved)
      const allRes = await partnersAPI.getMyPartnerships();
      if (allRes.success) {
        setPartnerships(allRes.partnerships || []);
      }
    } catch (err) {
      console.error("Error fetching partnerships:", err);
      setError(err.message || "Failed to fetch partnerships");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (partnershipId) => {
    try {
      console.log(`[MyPartners] Approving partnership ${partnershipId}`);
      const result = await partnersAPI.approvePartnership(partnershipId);
      console.log(`[MyPartners] Approve response:`, result);
      // Refresh all partnerships to reflect the status change
      await fetchPartnerships();
      // Switch to approved tab to show the newly approved partner
      setActiveTab("approved");
    } catch (err) {
      console.error("Error approving partnership:", err);
      setError(`Failed to approve partnership: ${err.message}`);
    }
  };

  const handleReject = async (partnershipId) => {
    try {
      await partnersAPI.rejectPartnership(partnershipId);
      fetchPartnerships();
    } catch (err) {
      console.error("Error rejecting partnership:", err);
      setError("Failed to reject partnership");
    }
  };

  const handleWithdraw = async (partnershipId) => {
    try {
      setWithdrawingId(partnershipId);
      await partnersAPI.withdrawPartnership(partnershipId);
      await fetchPartnerships();
      setActiveTab("sent");
      if (onPartnershipChange) {
        onPartnershipChange(partnershipId, "withdraw");
      }
    } catch (err) {
      console.error("Error withdrawing partnership:", err);
      setError(`Failed to withdraw request: ${err.message}`);
    } finally {
      setWithdrawingId(null);
    }
  };

  const pendingRequests = partnerships.filter(
    (p) => p.status === "pending" && p.role === "recipient"
  );

  const sentRequests = partnerships.filter(
    (p) => p.status === "pending" && p.role === "requester"
  );

  return (
    <div className="my-partners-modal">
      <div className="my-partners-overlay" onClick={onClose} />
      <div className="my-partners-content">
        <div className="my-partners-header">
          <h2>My Study Partners</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close partners modal"
          >
            ✕
          </button>
        </div>

        <div className="partners-tabs">
          <button
            className={`tab-btn ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved Partners ({approvedPartners.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => setActiveTab("sent")}
          >
            Sent Requests ({sentRequests.length})
          </button>
        </div>

        <div className="partners-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading partners...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchPartnerships} className="retry-btn">
                Retry
              </button>
            </div>
          ) : activeTab === "approved" ? (
            approvedPartners.length === 0 ? (
              <div className="empty-state">
                <p>No approved partners yet.</p>
              </div>
            ) : (
              <ul className="partners-list">
                {approvedPartners.map((partner) => (
                  <li key={partner._id} className="partner-item">
                    <div className="partner-info">
                      {partner.partner && partner.partner.profilePicture ? (
                        <img
                          src={getImageUrl(partner.partner.profilePicture)}
                          alt={partner.partner.fullName}
                          className="partner-avatar"
                        />
                      ) : (
                        <div className="partner-avatar-placeholder" style={{
                          width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0
                        }}>
                          {partner.partner?.nickname ? partner.partner.nickname.charAt(0).toUpperCase() : partner.partner?.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="partner-details">
                        <h3>{partner.partner.nickname || partner.partner.fullName}</h3>
                        <p className="partner-meta">
                          {partner.requestType}
                          {partner.subject && ` • ${partner.subject}`}
                        </p>
                        <p className="partner-score">
                          Compatibility: <strong>{partner.compatibilityScore}%</strong>
                        </p>
                        <p className="partner-date">
                          Connected {new Date(partner.connectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="partner-actions">
                      <button className="message-btn">Message</button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : activeTab === "pending" ? (
            pendingRequests.length === 0 ? (
              <div className="empty-state">
                <p>No pending requests.</p>
              </div>
            ) : (
              <ul className="partners-list">
                {pendingRequests.map((partnership) => (
                  <li key={partnership._id} className="partner-item">
                    <div className="partner-info">
                      {partnership.otherUser && partnership.otherUser.profilePicture ? (
                        <img
                          src={getImageUrl(partnership.otherUser.profilePicture)}
                          alt={partnership.otherUser.fullName}
                          className="partner-avatar"
                        />
                      ) : (
                        <div className="partner-avatar-placeholder" style={{
                          width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0
                        }}>
                          {partnership.otherUser?.nickname ? partnership.otherUser.nickname.charAt(0).toUpperCase() : partnership.otherUser?.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="partner-details">
                        <h3>{partnership.otherUser?.nickname || partnership.otherUser?.fullName}</h3>
                        <p className="partner-meta">
                          {partnership.requestType}
                          {partnership.subject && ` • ${partnership.subject}`}
                        </p>
                        <p className="partner-score">
                          Compatibility: <strong>{partnership.compatibilityScore}%</strong>
                        </p>
                        <p className="partner-status pending">Pending Request</p>
                      </div>
                    </div>
                    <div className="partner-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(partnership._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(partnership._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : activeTab === "sent" ? (
            sentRequests.length === 0 ? (
              <div className="empty-state">
                <p>No sent requests.</p>
                <p>Requests you send from Find Study Partners will appear here.</p>
              </div>
            ) : (
              <ul className="partners-list">
                {sentRequests.map((partnership) => (
                  <li key={partnership._id} className="partner-item">
                    <div className="partner-info">
                      {partnership.otherUser && partnership.otherUser.profilePicture ? (
                        <img
                          src={getImageUrl(partnership.otherUser.profilePicture)}
                          alt={partnership.otherUser.fullName}
                          className="partner-avatar"
                        />
                      ) : (
                        <div className="partner-avatar-placeholder" style={{
                          width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0
                        }}>
                          {partnership.otherUser?.nickname ? partnership.otherUser.nickname.charAt(0).toUpperCase() : partnership.otherUser?.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="partner-details">
                        <h3>{partnership.otherUser?.nickname || partnership.otherUser?.fullName}</h3>
                        <p className="partner-meta">
                          {partnership.requestType}
                          {partnership.subject && ` • ${partnership.subject}`}
                        </p>
                        <p className="partner-score">
                          Compatibility: <strong>{partnership.compatibilityScore}%</strong>
                        </p>
                        <p className="partner-status sent">Awaiting response</p>
                      </div>
                    </div>
                    <div className="partner-actions">
                      <button
                        className="withdraw-btn"
                        onClick={() => handleWithdraw(partnership._id)}
                        disabled={withdrawingId === partnership._id}
                      >
                        {withdrawingId === partnership._id ? "Withdrawing…" : "Withdraw"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MyPartners;
