import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicianAPI, authHelpers } from '../utils/api';
import PatientSearchAutocomplete from '../components/PatientSearchAutocomplete';
import DoctorNotesForm from '../components/DoctorNotesForm';
import DoctorNotesDisplay from '../components/DoctorNotesDisplay';
import '../styles/Dashboard.css';

export default function ClinicianDashboard() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [accessStatus, setAccessStatus] = useState('none');
  const [requestReason, setRequestReason] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDoctorNotesForm, setShowDoctorNotesForm] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const navigate = useNavigate();
  const user = authHelpers.getUser();

  useEffect(() => {
    if (activeTab === 'logs') {
      loadAuditLogs();
    }
  }, [activeTab]);

  // When a patient is selected from autocomplete
  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setError('');
    setLoading(true);

    try {
      // Get access status
      const response = await clinicianAPI.searchPatient(patient.id);
      setAccessStatus(response.data.accessStatus);

      // Reset forms
      setRequestReason('');
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
      setShowDoctorNotesForm(false);

      // If access is approved, load records and notes
      if (response.data.accessStatus === 'approved') {
        await loadPatientData(patient.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patient data');
      setSelectedPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (patientId) => {
    try {
      // This would need endpoints to get patient records
      // For now, we'll just load doctor notes
      await loadDoctorNotes(patientId);
    } catch (err) {
      console.error('Error loading patient data:', err);
    }
  };

  const loadDoctorNotes = async (patientId) => {
    setNotesLoading(true);
    try {
      // We'll fetch notes associated with this patient
      // This requires a new endpoint or we use the existing one
      setDoctorNotes([]);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSubmitAccessRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await clinicianAPI.submitAccessRequest(selectedPatient.id, requestReason);
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
        selectedPatient.id,
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
            {/* Search Section */}
            <div className="search-section">
              <h2>Search Patient</h2>

              {/* If a patient is selected, show selected patient card in place of search */}
              {selectedPatient ? (
                <div className="patient-info-card" style={{ animation: 'fadeIn 240ms ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 9999, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730a3', fontWeight: 700 }}>
                        {selectedPatient.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{selectedPatient.name || selectedPatient.username}</div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>{selectedPatient.email} • {selectedPatient.phone || '—'}</div>
                        <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>ID: {selectedPatient.username} • DB ID: {selectedPatient.id}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-danger" onClick={() => { setSelectedPatient(null); setAccessStatus('none'); }}>
                        Change patient
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <PatientSearchAutocomplete onSelectPatient={handleSelectPatient} />
                  <p className="text-sm text-gray-600 mt-2">Search by patient ID, name, or email to get started</p>
                </>
              )}
            </div>

            {/* Patient View - Only shown after selection (additional details) */}
            {selectedPatient && (
              <div className="search-results" style={{ marginTop: 20 }}>
                <div className="patient-info-card" style={{ animation: 'slideDown 220ms ease' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3>Patient Information</h3>
                      <div className="patient-details">
                        <p>
                          <strong>Name:</strong> {selectedPatient.name || selectedPatient.username}
                        </p>
                        <p>
                          <strong>Username:</strong> {selectedPatient.username}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedPatient.email}
                        </p>
                        <p>
                          <strong>Patient ID:</strong> {selectedPatient.id}
                        </p>
                      </div>
                    </div>
                    <div className="access-status">
                      <span className={`status-badge ${getAccessStatusBadge().class}`}>
                        {getAccessStatusBadge().text}
                      </span>
                    </div>
                  </div>

                  {/* Access Request Section */}
                  {accessStatus === 'none' && (
                    <form onSubmit={handleSubmitAccessRequest} className="access-request-form">
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
                />
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
                        ⏳ Your access request is pending patient approval. You will be able to
                        upload records and add doctor notes once approved.
                      </p>
                    </div>
                  )}

                  {accessStatus === 'rejected' && (
                    <div className="rejected-message">
                      <p>
                        ❌ Your access request has been rejected by the patient. You cannot upload
                        records for this patient.
                      </p>
                    </div>
                  )}

                  {/* Upload Section */}
                  {accessStatus === 'approved' && (
                    <>
                      <form onSubmit={handleUploadRecord} className="upload-form">
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
                            onChange={(e) => setUploadDescription(e.target.value)}
                            placeholder="Additional notes about this record"
                            rows="3"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="file">Upload File</label>
                          <input
                            type="file"
                            id="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            required
                          />
                          <p className="file-help">
                            Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)
                          </p>
                        </div>

                        {selectedFile && (
                          <p className="selected-file">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
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

                      {/* Doctor Notes Section */}
                      <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-gray-800">Doctor Notes</h4>
                          <button
                            onClick={() => setShowDoctorNotesForm(!showDoctorNotesForm)}
                            className="btn btn-primary btn-small"
                          >
                            {showDoctorNotesForm ? '✕ Cancel' : '+ Add Note'}
                          </button>
                        </div>

                        {showDoctorNotesForm && (
                          <div className="notes-form-container">
                            <DoctorNotesForm
                              defaultPatientUsername={selectedPatient.username}
                              onNoteAdded={() => {
                                setShowDoctorNotesForm(false);
                                setSuccess('Doctor note added successfully!');
                                setTimeout(() => setSuccess(''), 3000);
                              }}
                              onCancel={() => setShowDoctorNotesForm(false)}
                            />
                          </div>
                        )}

                        <DoctorNotesDisplay
                          notes={doctorNotes}
                          loading={notesLoading}
                          error={error}
                        />
                      </div>
                    </>
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
