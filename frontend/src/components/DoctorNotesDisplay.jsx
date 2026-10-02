import React from 'react';
import { Calendar, User, AlertCircle } from 'lucide-react';

export default function DoctorNotesDisplay({ notes, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Doctor Notes</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading notes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Doctor Notes</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No doctor notes for this patient</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-800">
                    You (Dr. {note.provider_username || 'Unknown'})
                  </span>
                </div>
                {note.reminder && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    📞 Reminder Set
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-3 leading-relaxed">{note.note}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Appointment: {new Date(note.appointment_date).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Written: {new Date(note.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
