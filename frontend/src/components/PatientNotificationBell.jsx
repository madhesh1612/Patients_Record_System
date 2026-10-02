import React, { useState, useEffect } from 'react';
import { Bell, Calendar, User, X } from 'lucide-react';
import { patientAPI } from '../utils/api.js';

export default function PatientNotificationBell() {
  const [notes, setNotes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load notes on mount
    fetchDoctorNotes();
  }, []);

  const fetchDoctorNotes = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await patientAPI.getDoctorNotes();
      if (response && response.data) {
        setNotes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      // Silently fail - don't break the dashboard if notes fail to load
      console.warn('Warning: Could not load doctor notes:', err.message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Count notes with upcoming reminders (appointments within next 7 days)
  const getUpcomingReminderCount = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return notes.filter((note) => {
      if (!note.reminder) return false;
      const appointmentDate = new Date(note.appointment_date);
      return appointmentDate >= now && appointmentDate <= sevenDaysFromNow;
    }).length;
  };

  const upcomingCount = getUpcomingReminderCount();

  return (
    <>
      {/* Bell Icon Button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPopup(!showPopup)}
          style={{
            position: 'relative',
            padding: '8px',
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#1f2937';
            e.target.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#4b5563';
            e.target.style.backgroundColor = 'transparent';
          }}
          title="Doctor Notes & Reminders"
        >
          <Bell size={24} />
          {upcomingCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '0',
                right: '0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '4px',
                paddingBottom: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#dc2626',
                borderRadius: '9999px',
                transform: 'translate(50%, -50%)',
              }}
            >
              {upcomingCount > 9 ? '9+' : upcomingCount}
            </span>
          )}
        </button>

        {/* Popup */}
        {showPopup && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              width: '384px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              zIndex: 50,
              maxHeight: '384px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Popup Header */}
            <div
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f9fafb',
              }}
            >
              <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Doctor Notes & Reminders
              </h3>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#374151')}
                onMouseLeave={(e) => (e.target.style.color = '#6b7280')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Popup Content */}
            <div
              style={{
                flex: '1',
                overflowY: 'auto',
                padding: '16px',
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                  Loading...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#ef4444' }}>
                  {error}
                </div>
              ) : notes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                  No doctor notes yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notes.map((note) => {
                    const appointmentDate = new Date(note.appointment_date);
                    const isUpcoming = () => {
                      const now = new Date();
                      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                      return appointmentDate >= now && appointmentDate <= sevenDaysFromNow && note.reminder;
                    };

                    return (
                      <div
                        key={note.id}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: isUpcoming() ? '1px solid #fcd34d' : '1px solid #e5e7eb',
                          backgroundColor: isUpcoming() ? '#fffbeb' : '#f9fafb',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                            <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                              Dr. {note.provider_username}
                            </span>
                          </div>
                          {note.reminder && (
                            <span
                              style={{
                                fontSize: '12px',
                                backgroundColor: '#fef08a',
                                color: '#92400e',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                paddingTop: '4px',
                                paddingBottom: '4px',
                                borderRadius: '4px',
                              }}
                            >
                              📞 Reminder
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            color: '#374151',
                            fontSize: '14px',
                            marginBottom: '8px',
                            margin: '0 0 8px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {note.note}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                          <Calendar size={12} />
                          {appointmentDate.toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Popup Footer */}
            {notes.length > 0 && (
              <div
                style={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  borderTop: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                Showing {notes.length} note{notes.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backdrop to close popup */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            inset: '0',
            zIndex: 40,
          }}
          onClick={() => setShowPopup(false)}
        />
      )}
    </>
  );
}
