import React, { useState } from 'react';
import { clinicianAPI } from '../utils/api.js';

export default function DoctorNotesForm({ onNoteAdded, onCancel }) {
  const [patientUsername, setPatientUsername] = useState('');
  const [note, setNote] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [reminder, setReminder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!patientUsername.trim()) {
      setError('Patient username is required');
      return;
    }

    if (!note.trim()) {
      setError('Note content is required');
      return;
    }

    if (!appointmentDate) {
      setError('Appointment date is required');
      return;
    }

    setLoading(true);

    try {
      const response = await clinicianAPI.addNote(
        patientUsername.trim(),
        note.trim(),
        appointmentDate,
        reminder
      );

      setSuccess('Doctor note added successfully!');
      setPatientUsername('');
      setNote('');
      setAppointmentDate('');
      setReminder(false);

      // Call callback to refresh notes list if needed
      if (onNoteAdded) {
        onNoteAdded(response.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        'Failed to add doctor note';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Doctor Note</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Username
          </label>
          <input
            type="text"
            value={patientUsername}
            onChange={(e) => setPatientUsername(e.target.value)}
            placeholder="Enter patient username"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter clinical notes..."
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Date
          </label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="reminder"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            disabled={loading}
          />
          <label htmlFor="reminder" className="ml-2 text-sm text-gray-700 cursor-pointer">
            Send SMS reminder 1 day before appointment
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
