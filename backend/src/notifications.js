const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Twilio client (optional - only if credentials provided)
let client = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Send SMS reminder via Twilio
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS message
 * @returns {Promise<object>} Twilio response
 */
const sendSMSReminder = async (phoneNumber, message) => {
  if (!client) {
    console.warn(
      'Twilio credentials not configured. SMS reminder not sent. Message:'
    );
    console.warn(`To: ${phoneNumber}`);
    console.warn(`Text: ${message}`);
    return { success: false, message: 'Twilio not configured' };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`✓ SMS sent to ${phoneNumber}. SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send appointment reminder
 * @param {string} phoneNumber - Patient phone number
 * @param {string} appointmentDate - Appointment date
 * @param {string} description - Appointment description
 * @returns {Promise<object>} Result
 */
const sendAppointmentReminder = async (phoneNumber, appointmentDate, description) => {
  const date = new Date(appointmentDate);
  const formattedDate = date.toLocaleString();
  const message = `Appointment Reminder: ${description || 'You have an upcoming appointment'} on ${formattedDate}. Please arrive 15 minutes early.`;

  return sendSMSReminder(phoneNumber, message);
};

/**
 * Send access request notification
 * @param {string} phoneNumber - Patient phone number
 * @param {string} clinicianName - Clinician name
 * @returns {Promise<object>} Result
 */
const sendAccessRequestNotification = async (phoneNumber, clinicianName) => {
  const message = `${clinicianName} has requested access to your medical records. Please review and approve/reject in your dashboard.`;
  return sendSMSReminder(phoneNumber, message);
};

/**
 * Send access approved notification
 * @param {string} phoneNumber - Clinician phone number
 * @param {string} patientName - Patient name
 * @returns {Promise<object>} Result
 */
const sendAccessApprovedNotification = async (phoneNumber, patientName) => {
  const message = `${patientName} has approved your access request. You can now upload and edit their medical records.`;
  return sendSMSReminder(phoneNumber, message);
};

/**
 * Send access rejected notification
 * @param {string} phoneNumber - Clinician phone number
 * @param {string} patientName - Patient name
 * @returns {Promise<object>} Result
 */
const sendAccessRejectedNotification = async (phoneNumber, patientName) => {
  const message = `${patientName} has rejected your access request to their medical records.`;
  return sendSMSReminder(phoneNumber, message);
};

module.exports = {
  sendSMSReminder,
  sendAppointmentReminder,
  sendAccessRequestNotification,
  sendAccessApprovedNotification,
  sendAccessRejectedNotification,
};
