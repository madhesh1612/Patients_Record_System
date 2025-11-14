import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION API CALLS
// ============================================================================

export const authAPI = {
  register: (name, username, email, password, role, phone_number) =>
    api.post('/auth/register', {
      name,
      username,
      email,
      password,
      role,
      phone_number,
    }),

  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  googleLogin: (credential) =>
    api.post('/auth/google', { credential }),

  verify: () => api.post('/auth/verify'),
};

// ============================================================================
// PATIENT API CALLS
// ============================================================================

export const patientAPI = {
  getDashboard: () => api.get('/patient/dashboard'),

  downloadRecord: (recordId) =>
    api.get(`/patient/records/${recordId}/download`, {
      responseType: 'blob',
    }),

  approveAccessRequest: (requestId) =>
    api.put(`/patient/access-requests/${requestId}/approve`),

  rejectAccessRequest: (requestId) =>
    api.put(`/patient/access-requests/${requestId}/reject`),

  getDoctorNotes: () =>
    api.get('/notes/me'),
};

// ============================================================================
// CLINICIAN API CALLS
// ============================================================================

export const clinicianAPI = {
  searchPatient: (patientId) =>
    api.get(`/clinician/search/${patientId}`),

  submitAccessRequest: (patient_id, reason) =>
    api.post('/clinician/access-request', { patient_id, reason }),

  uploadRecord: (patient_id, title, description, file) => {
    const formData = new FormData();
    formData.append('patient_id', patient_id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    return api.post('/clinician/records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateRecord: (recordId, title, description) =>
    api.put(`/clinician/records/${recordId}`, { title, description }),

  deleteRecord: (recordId) =>
    api.delete(`/clinician/records/${recordId}`),

  getAuditLogs: (limit = 50, offset = 0) =>
    api.get('/audit-logs', { params: { limit, offset } }),

  scheduleReminder: (patient_id, appointment_date, appointment_description) =>
    api.post('/reminders/schedule', {
      patient_id,
      appointment_date,
      appointment_description,
    }),

  getPendingReminders: () =>
    api.get('/reminders/pending'),

  markReminderSent: (reminderId) =>
    api.put(`/reminders/${reminderId}/send`),

  addNote: (patient_username, note, appointment_date, reminder) =>
    api.post('/notes/add', {
      patient_username,
      note,
      appointment_date,
      reminder,
    }),

  searchPatients: (query) =>
    // send both 'q' and 'query' so backend accepts either format
    api.get('/search/patient', { params: { q: query, query } }),
};

// ============================================================================
// AUTH HELPER FUNCTIONS
// ============================================================================

export const authHelpers = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  getToken: () => localStorage.getItem('token'),

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  isPatient: () => authHelpers.getUser()?.role === 'patient',

  isClinician: () => authHelpers.getUser()?.role === 'clinician',

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;
