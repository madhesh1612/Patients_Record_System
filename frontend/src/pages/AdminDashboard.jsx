import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, LogOut, RefreshCw, X, ShieldCheck, User, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { adminAPI, authHelpers } from '../utils/api';
import ArogyamNavbar from '../components/ArogyamNavbar';

const statuses = ['pending', 'approved', 'rejected'];

export default function AdminDashboard() {
  const [status, setStatus] = useState('pending');
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = authHelpers.getUser();

  const loadClinicians = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getClinicians(status);
      setClinicians(response.data.clinicians || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load clinician applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinicians();
  }, [status]);

  const handleDecision = async (clinician, decision) => {
    setBusyId(clinician.id);
    setError('');
    setMessage('');
    try {
      if (decision === 'approve') {
        await adminAPI.approveClinician(clinician.id);
      } else {
        await adminAPI.rejectClinician(clinician.id);
      }
      setMessage(`${clinician.username} ${decision === 'approve' ? 'approved' : 'rejected'}.`);
      await loadClinicians();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update clinician access.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="arogyam-page-canvas">
      <ArogyamNavbar />

      <main style={{ maxWidth: '1040px', margin: '30px auto 80px', padding: '0 20px', width: '100%' }}>
        {/* Top Header Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f3e8ff', color: '#7c3aed', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
              <ShieldCheck size={14} /> Administrator Control Center
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0, color: 'var(--arogyam-text-main)' }}>
              Clinician <em>Access &amp; Approvals</em>
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--arogyam-text-muted)', fontSize: '0.92rem' }}>
              Logged in as <strong>{user?.username}</strong> &bull; Review healthcare provider privileges
            </p>
          </div>

          <button
            type="button"
            onClick={loadClinicians}
            disabled={loading}
            className="btn-pill-white"
            style={{ fontSize: '0.88rem', padding: '10px 18px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh List
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', background: 'var(--arogyam-surface)', border: '1px solid var(--arogyam-border)', borderRadius: '9999px', padding: '4px', gap: '4px', maxWidth: '400px', marginBottom: '24px' }}>
          {statuses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: status === item ? (item === 'pending' ? 'var(--arogyam-terracotta)' : item === 'approved' ? 'var(--arogyam-emerald)' : '#ef4444') : 'transparent',
                color: status === item ? '#ffffff' : 'var(--arogyam-text-muted)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', color: '#991b1b', fontSize: '0.88rem', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', color: '#166534', fontSize: '0.88rem', marginBottom: '18px' }}>
            {message}
          </div>
        )}

        {/* Clinicians List */}
        <div className="arogyam-card" style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--arogyam-text-muted)' }}>
              Loading clinician applications...
            </div>
          ) : clinicians.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--arogyam-text-main)', marginBottom: '4px' }}>
                No {status} clinician applications
              </div>
              <p style={{ color: 'var(--arogyam-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                {status === 'pending' ? 'All clinician registrations have been processed.' : `There are no clinicians marked as ${status}.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {clinicians.map((clinician) => (
                <div
                  key={clinician.id}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--arogyam-text-main)' }}>
                        {clinician.username}
                      </strong>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          background: clinician.approval_status === 'approved' ? '#dcfce7' : clinician.approval_status === 'rejected' ? '#fee2e2' : '#fef3c7',
                          color: clinician.approval_status === 'approved' ? '#166534' : clinician.approval_status === 'rejected' ? '#991b1b' : '#92400e',
                        }}
                      >
                        {clinician.approval_status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--arogyam-text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={14} /> {clinician.email}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> {clinician.phone_number || 'No phone'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(clinician.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDecision(clinician, 'approve')}
                          disabled={busyId === clinician.id}
                          style={{
                            background: 'var(--arogyam-emerald)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Check size={16} /> Approve Access
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(clinician, 'reject')}
                          disabled={busyId === clinician.id}
                          style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            borderRadius: '9999px',
                            padding: '8px 14px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <X size={16} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
