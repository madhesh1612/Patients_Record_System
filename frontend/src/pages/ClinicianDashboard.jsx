import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicianAPI, authHelpers } from '../utils/api';
import '../styles/Dashboard.css';

export default function ClinicianDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [patientId, setPatientId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [accessStatus, setAccessStatus] = useState('none');
  const [requestReason, setRequestReason] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = authHelpers.getUser();

  useEffect(() => {
    if (activeTab === 'logs') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await clinicianAPI.searchPatient(patientId);
      setSearchResult(response.data.patient);
      setAccessStatus(response.data.accessStatus);
      setRequestReason('');
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Patient not found');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAccessRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await clinicianAPI.submitAccessRequest(patientId, requestReason);
      setSuccess('Access request submitted successfully!');
      setAccessStatus('pending');
      setRequestReason('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRecord = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!uploadTitle) {
      setError('Please enter a record title');
      return;
    }

    setLoading(true);

    try {
      await clinicianAPI.uploadRecord(
        patientId,
        uploadTitle,
        uploadDescription,
        selectedFile
      );
      setSuccess('Record uploaded successfully!');
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload record');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await clinicianAPI.getAuditLogs();
      setAuditLogs(response.data.logs);
    } catch (err) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getAccessStatusBadge = () => {
    const badges = {
      none: { class: 'status-none', text: 'No Request' },
      pending: { class: 'status-pending', text: 'Request Pending' },
      approved: { class: 'status-approved', text: 'Access Approved' },
      rejected: { class: 'status-rejected', text: 'Request Rejected' },
    };
    return badges[accessStatus] || badges.none;
  };

  const handleLogout = () => {
    authHelpers.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Clinician Dashboard</h1>
            <p>Welcome, Dr. {user?.username}!</p>
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Find Patient
          </button>
          <button
            className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Audit Logs
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <section className="tab-content">
            {/* Search Form */}
            <div className="search-section">
              <h2>Search Patient</h2>
              <form onSubmit={handleSearchPatient} className="search-form">
                <div className="form-group">
                  <label htmlFor="patientId">Patient ID</label>
                  <input
                    type="number"
                    id="patientId"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter patient ID"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {/* Search Results */}
            {searchResult && (
              <div className="search-results">
                <div className="patient-info-card">
                  <h3>Patient Information</h3>
                  <div className="patient-details">
                    <p>
                      <strong>Name:</strong> {searchResult.username}
                    </p>
                    <p>
                      <strong>Email:</strong> {searchResult.email}
                    </p>
                    <p>
                      <strong>Patient ID:</strong> {searchResult.id}
                    </p>
                  </div>

                  <div className="access-status">
                    <span
                      className={`status-badge ${getAccessStatusBadge().class}`}
                    >
                      {getAccessStatusBadge().text}
                    </span>
                  </div>

                  {/* Access Request Section */}
                  {accessStatus === 'none' && (
                    <form
                      onSubmit={handleSubmitAccessRequest}
                      className="access-request-form"
                    >
                      <h4>Request Access to Medical Records</h4>
                      <div className="form-group">
                        <label htmlFor="reason">Reason for Access</label>
                        <textarea
                          id="reason"
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                          placeholder="Explain why you need access to this patient's records"
                          required
                          rows="4"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </form>
                  )}

                  {accessStatus === 'pending' && (
                    <div className="pending-message">
                      <p>
                        ⏳ Your access request is pending patient approval.
                        You will be able to upload records once approved.
                      </p>
                    </div>
                  )}

                  {accessStatus === 'rejected' && (
                    <div className="rejected-message">
                      <p>
                        ❌ Your access request has been rejected by the patient.
                        You cannot upload records for this patient.
                      </p>
                    </div>
                  )}

                  {/* Upload Section */}
                  {accessStatus === 'approved' && (
                    <form
                      onSubmit={handleUploadRecord}
                      className="upload-form"
                    >
                      <h4>Upload Medical Record</h4>
                      <div className="form-group">
                        <label htmlFor="title">Record Title</label>
                        <input
                          type="text"
                          id="title"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          placeholder="e.g., Blood Work Results"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          value={uploadDescription}
                          onChange={(e) =>
                            setUploadDescription(e.target.value)
                          }
                          placeholder="Additional notes about this record"
                          rows="3"
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label htmlFor="file">Upload File</label>
                        <input
                          type="file"
                          id="file"
                          onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          required
                        />
                        <p className="file-help">
                          Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max
                          10MB)
                        </p>
                      </div>

                      {selectedFile && (
                        <p className="selected-file">
                          Selected: {selectedFile.name} (
                          {(selectedFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}

                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={loading}
                      >
                        {loading ? 'Uploading...' : '📤 Upload Record'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'logs' && (
          <section className="tab-content">
            <h2>Audit Logs</h2>
            {auditLogs.length === 0 ? (
              <p className="empty-state">No audit logs yet.</p>
            ) : (
              <div className="audit-logs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Target</th>
                      <th>Patient ID</th>
                      <th>Timestamp</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span className="action-badge">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>{log.target_type}</td>
                        <td>{log.patient_id || '-'}</td>
                        <td>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td>{log.ip_address || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
