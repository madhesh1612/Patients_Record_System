import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, authHelpers } from '../utils/api';
import PatientNotificationBell from '../components/PatientNotificationBell';
import '../styles/Dashboard.css';

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('records');
  const navigate = useNavigate();
  const user = authHelpers.getUser();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getDashboard();
      setRecords(response.data.records);
      setAccessRequests(response.data.accessRequests);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await patientAPI.approveAccessRequest(requestId);
      setSuccess('Access request approved!');
      loadDashboard();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await patientAPI.rejectAccessRequest(requestId);
      setSuccess('Access request rejected!');
      loadDashboard();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogout = () => {
    authHelpers.logout();
    navigate('/login');
  };

  const handleDownload = async (record) => {
    try {
      const response = await patientAPI.downloadRecord(record.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', record.file_name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download file');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Patient Dashboard</h1>
            <p>Welcome, {user?.username}!</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <PatientNotificationBell />
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            Medical Records ({records.length})
          </button>
          <button
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Access Requests ({accessRequests.length})
          </button>
        </div>

        {/* Records Tab */}
        {activeTab === 'records' && (
          <section className="tab-content">
            <h2>Your Medical Records</h2>
            {records.length === 0 ? (
              <p className="empty-state">
                No medical records yet. Records will appear here when clinicians
                upload them.
              </p>
            ) : (
              <div className="records-grid">
                {records.map((record) => (
                  <div key={record.id} className="record-card">
                    <div className="record-header">
                      <h3>{record.title}</h3>
                      <span className="record-date">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {record.description && (
                      <p className="record-description">{record.description}</p>
                    )}
                    <div className="record-meta">
                      <span className="clinician">
                        By: {record.clinician_name}
                      </span>
                      <span className="file-size">
                        {(record.file_size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <button
                      className="btn btn-small"
                      onClick={() => handleDownload(record)}
                    >
                      📥 Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {/* Access Requests Tab */}
        {activeTab === 'requests' && (
          <section className="tab-content">
            <h2>Pending Access Requests</h2>
            {accessRequests.length === 0 ? (
              <p className="empty-state">
                No access requests. Clinicians will request access here.
              </p>
            ) : (
              <div className="requests-list">
                {accessRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`request-card status-${request.status}`}
                  >
                    <div className="request-header">
                      <h3>{request.clinician_name}</h3>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </div>
                    <p className="clinician-email">
                      Email: {request.clinician_email}
                    </p>
                    <p className="request-reason">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <p className="request-date">
                      Requested on:{' '}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>

                    {request.status === 'pending' && (
                      <div className="request-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => handleApprove(request.id)}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleReject(request.id)}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
