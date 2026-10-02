import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, Check, X, ShieldAlert, HeartPulse, Clock, User, Sparkles } from 'lucide-react';
import { patientAPI, authHelpers } from '../utils/api';
import ArogyamNavbar from '../components/ArogyamNavbar';
import PatientNotificationBell from '../components/PatientNotificationBell';

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
      setRecords(response.data.records || []);
      setAccessRequests(response.data.accessRequests || []);
    } catch (err) {
      setError('Failed to load dashboard records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await patientAPI.approveAccessRequest(requestId);
      setSuccess('Physician access request approved!');
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
      setSuccess('Physician access request declined.');
      loadDashboard();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
      setTimeout(() => setError(''), 3000);
    }
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

  return (
    <div className="arogyam-page-canvas">
      <ArogyamNavbar />

      <main style={{ maxWidth: '1040px', margin: '30px auto 80px', padding: '0 20px', width: '100%' }}>
        {/* Welcome Top Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
              <HeartPulse size={14} /> Personal Health Vault
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0, color: 'var(--arogyam-text-main)' }}>
              Welcome back, <em>{user?.username}</em>
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--arogyam-text-muted)', fontSize: '0.92rem' }}>
              Encrypted health record repository &amp; physician permission hub
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PatientNotificationBell />
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', color: '#991b1b', fontSize: '0.88rem', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', color: '#166534', fontSize: '0.88rem', marginBottom: '18px' }}>
            {success}
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--arogyam-surface)', border: '1px solid var(--arogyam-border)', borderRadius: '9999px', padding: '4px', gap: '4px', maxWidth: '440px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'records' ? 'var(--arogyam-terracotta)' : 'transparent',
              color: activeTab === 'records' ? '#ffffff' : 'var(--arogyam-text-muted)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Medical Records ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'requests' ? 'var(--arogyam-terracotta)' : 'transparent',
              color: activeTab === 'requests' ? '#ffffff' : 'var(--arogyam-text-muted)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Access Requests ({accessRequests.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'records' && (
          <div className="arogyam-card" style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 16px', color: 'var(--arogyam-text-main)' }}>
              Your Electronic Health Records
            </h2>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: 'var(--arogyam-text-muted)' }}>Loading medical records...</p>
            ) : records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--arogyam-bg-subtle)', borderRadius: '16px', border: '1px dashed var(--arogyam-border)' }}>
                <FileText size={32} style={{ color: 'var(--arogyam-text-subtle)', margin: '0 auto 10px' }} />
                <div style={{ fontWeight: '600', color: 'var(--arogyam-text-main)' }}>No records uploaded yet</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--arogyam-text-muted)', margin: '4px 0 0' }}>
                  When your doctor or clinician uploads test results or treatment summaries, they will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {records.map((record) => (
                  <div
                    key={record.id}
                    style={{
                      background: 'var(--arogyam-bg-subtle)',
                      border: '1px solid var(--arogyam-border)',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--arogyam-text-main)' }}>{record.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--arogyam-text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {record.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--arogyam-text-muted)', margin: '6px 0 0', lineHeight: '1.4' }}>
                          {record.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--arogyam-border)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--arogyam-text-subtle)' }}>
                        Dr: {record.clinician_name || 'Healthcare Staff'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownload(record)}
                        style={{
                          background: 'var(--arogyam-terracotta)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '5px 12px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="arogyam-card" style={{ padding: '28px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', margin: '0 0 16px', color: 'var(--arogyam-text-main)' }}>
              Physician Permission Requests
            </h2>

            {accessRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--arogyam-bg-subtle)', borderRadius: '16px', border: '1px dashed var(--arogyam-border)' }}>
                <ShieldAlert size={32} style={{ color: 'var(--arogyam-text-subtle)', margin: '0 auto 10px' }} />
                <div style={{ fontWeight: '600', color: 'var(--arogyam-text-main)' }}>No pending access requests</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--arogyam-text-muted)', margin: '4px 0 0' }}>
                  When a doctor requests permission to review your health records, you can approve or decline here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {accessRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      background: 'var(--arogyam-bg-subtle)',
                      border: '1px solid var(--arogyam-border)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--arogyam-text-main)' }}>
                          Dr. {request.clinician_name}
                        </strong>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            background: request.status === 'approved' ? '#dcfce7' : request.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: request.status === 'approved' ? '#166534' : request.status === 'rejected' ? '#991b1b' : '#92400e',
                          }}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--arogyam-text-muted)', marginTop: '4px' }}>
                        <strong>Reason:</strong> {request.reason}
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleApprove(request.id)}
                          style={{
                            background: 'var(--arogyam-emerald)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '7px 16px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={14} /> Authorize Access
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(request.id)}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '9999px',
                            padding: '7px 14px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
