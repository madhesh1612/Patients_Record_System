import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import { clinicianAPI } from '../utils/api.js';

export default function PatientSearchAutocomplete({ onSelectPatient }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Debounced search with 300ms, hide for <2 chars
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await clinicianAPI.searchPatients(trimmed);
        const data = response.data || [];
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const handleSelectPatient = (patient) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSelectPatient) onSelectPatient(patient);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 14, top: 12, color: '#9ca3af' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder="Search patient by ID, Name, or Email"
          aria-label="Search patient"
          style={{
            width: '100%',
            padding: '12px 44px',
            borderRadius: '9999px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            fontSize: '15px',
            outline: 'none',
          }}
        />

        {query && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: 12,
              top: 8,
              background: 'transparent',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <X />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          style={{
            marginTop: 8,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
            border: '1px solid #e6edf3',
            maxHeight: 320,
            overflowY: 'auto',
            transition: 'all 180ms ease',
            zIndex: 60,
          }}
        >
          {loading && (
            <div style={{ padding: 14, color: '#6b7280', textAlign: 'center' }}>Searching...</div>
          )}

          {!loading && suggestions.length === 0 && (
            <div style={{ padding: 14, color: '#6b7280', textAlign: 'center' }}>No patients found</div>
          )}

          {!loading && suggestions.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPatient(p)}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                width: '100%',
                padding: '10px 14px',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 9999, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <User size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name || p.username}</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{p.username}</span>
                  <span style={{ opacity: 0.7 }}>•</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
