const express = require('express');
const router = express.Router();
const db = require('./db');
const auth = require('./auth');
const upload = require('./uploadFile');
const notifications = require('./notifications');
const fs = require('fs');
const path = require('path');

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * POST /auth/register
 * Register a new user (patient or clinician)
 * Body: { name, username, email, password, role, phone_number }
 */
router.post('/auth/register', async (req, res) => {
  try {
    const { name, username, email, password, role, phone_number } = req.body;

    // Validate input
    if (!name || !username || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: name, username, email, password, role' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: 'Invalid email format' });
    }

    if (!['patient', 'clinician'].includes(role)) {
      return res
        .status(400)
        .json({ error: 'Role must be either "patient" or "clinician"' });
    }

    // Check if username already exists
    const existingUsername = await db.getOne(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUsername) {
      return res
        .status(409)
        .json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await db.getOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail) {
      return res
        .status(409)
        .json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await auth.hashPassword(password);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
      [username, email, passwordHash, role, phone_number || null]
    );

    const user = result.rows[0];

    // Generate token
    const token = auth.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { ...user, name },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    // Handle unique constraint violations (SQLite or Postgres)
    if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
      return res
        .status(409)
        .json({ error: 'Username or email already exists' });
    }
    // If DB is not reachable, surface a clearer message to the client
    if (error && (error.code === 'ECONNREFUSED' || error?.errors?.some?.(e => e.code === 'ECONNREFUSED'))) {
      return res.status(503).json({ error: 'Database unreachable. Please ensure Postgres is running and configured in backend/.env' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/login
 * Login user and get JWT token
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password required' });
    }

    // Find user
    const user = await db.getOne(
      'SELECT id, username, email, role, password_hash FROM users WHERE username = $1',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await auth.comparePassword(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = auth.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error && (error.code === 'ECONNREFUSED' || error?.errors?.some?.(e => e.code === 'ECONNREFUSED'))) {
      return res.status(503).json({ error: 'Database unreachable. Please ensure Postgres is running and configured in backend/.env' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/google
 * Google OAuth login/registration
 */
router.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    // Verify and decode the Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr);
      return res.status(401).json({ error: 'Invalid Google credential' });
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user already exists
    let user = await db.getOne(
      'SELECT id, username, email, role FROM users WHERE email = $1',
      [email]
    );

    if (!user) {
      // Auto-create user with role = patient
      // Use email as username
      const username = email.split('@')[0]; // e.g., "john" from "john@gmail.com"
      const passwordHash = 'GOOGLE_OAUTH'; // Mark as Google OAuth user

      try {
        const result = await db.query(
          'INSERT INTO users (username, email, password_hash, role, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
          [username, email, passwordHash, 'patient', null]
        );
        user = result.rows[0];
      } catch (insertErr) {
        console.error('Error creating Google user:', insertErr);
        // Handle duplicate username case
        if (insertErr.code === 'SQLITE_CONSTRAINT' || insertErr.code === '23505') {
          // Generate a unique username
          const uniqueUsername = `${email.split('@')[0]}_${Date.now()}`;
          const result = await db.query(
            'INSERT INTO users (username, email, password_hash, role, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
            [uniqueUsername, email, passwordHash, 'patient', null]
          );
          user = result.rows[0];
        } else {
          throw insertErr;
        }
      }
    }

    // Generate JWT token
    const token = auth.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      message: 'Google login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    if (error && (error.code === 'ECONNREFUSED' || error?.errors?.some?.(e => e.code === 'ECONNREFUSED'))) {
      return res.status(503).json({ error: 'Database unreachable' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/verify
 * Verify JWT token
 */
router.post('/auth/verify', auth.authenticate, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user,
  });
});

// ============================================================================
// PATIENT ENDPOINTS
// ============================================================================

/**
 * GET /patient/dashboard
 * Get patient's medical records and access requests
 */
router.get(
  '/patient/dashboard',
  auth.authenticate,
  auth.requireRole('patient'),
  async (req, res) => {
    try {
      const patientId = req.user.id;

      // Get patient's medical records
      const records = await db.getAll(
        `SELECT r.id, r.title, r.description, r.file_name, r.file_size, r.mime_type,
                r.created_at, r.updated_at, u.username as clinician_name
         FROM records r
         LEFT JOIN users u ON r.clinician_id = u.id
         WHERE r.patient_id = $1
         ORDER BY r.created_at DESC`,
        [patientId]
      );

      // Get pending access requests
      const accessRequests = await db.getAll(
        `SELECT ar.id, ar.status, ar.reason, ar.created_at, u.username as clinician_name, u.email as clinician_email
         FROM access_requests ar
         JOIN users u ON ar.clinician_id = u.id
         WHERE ar.patient_id = $1
         ORDER BY ar.created_at DESC`,
        [patientId]
      );

      res.json({
        records,
        accessRequests,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /patient/records/:recordId/download
 * Download a medical record (patient can only download their own)
 */
router.get(
  '/patient/records/:recordId/download',
  auth.authenticate,
  auth.requireRole('patient'),
  async (req, res) => {
    try {
      const patientId = req.user.id;
      const recordId = req.params.recordId;

      // Verify record belongs to patient
      const record = await db.getOne(
        'SELECT id, file_path FROM records WHERE id = $1 AND patient_id = $2',
        [recordId, patientId]
      );

      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      // Download file
      res.download(record.file_path);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ============================================================================
// CLINICIAN ENDPOINTS
// ============================================================================

/**
 * GET /search/patient
 * Search patients by username, email, or name for autocomplete
 * Query: ?query=searchTerm
 */
router.get(
  '/search/patient',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const { query } = req.query;

      if (!query || query.trim().length < 1) {
        return res.json([]);
      }

      const searchTerm = `%${query.trim().toLowerCase()}%`;

      const patients = await db.query(
        `SELECT id, username, email FROM users 
         WHERE role = $1 AND (LOWER(username) LIKE $2 OR LOWER(email) LIKE $2)
         LIMIT 10`,
        ['patient', searchTerm]
      );

      res.json(patients.rows || []);
    } catch (error) {
      console.error('Patient search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /clinician/search/:patientId
 * Search patient by ID and get their info
 */
router.get(
  '/clinician/search/:patientId',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const patientId = req.params.patientId;

      const patient = await db.getOne(
        'SELECT id, username, email FROM users WHERE id = $1 AND role = $2',
        [patientId, 'patient']
      );

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Get access request status
      const accessRequest = await db.getOne(
        'SELECT status FROM access_requests WHERE clinician_id = $1 AND patient_id = $2',
        [req.user.id, patientId]
      );

      res.json({
        patient,
        accessStatus: accessRequest?.status || 'none',
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /clinician/access-request
 * Submit access request to patient's records
 */
router.post(
  '/clinician/access-request',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const { patient_id, reason } = req.body;
      const clinicianId = req.user.id;

      if (!patient_id || !reason) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: patient_id, reason' });
      }

      // Check if patient exists
      const patient = await db.getOne(
        'SELECT id, phone_number FROM users WHERE id = $1 AND role = $2',
        [patient_id, 'patient']
      );

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Check if request already exists
      const existingRequest = await db.getOne(
        'SELECT id FROM access_requests WHERE clinician_id = $1 AND patient_id = $2',
        [clinicianId, patient_id]
      );

      if (existingRequest) {
        return res
          .status(409)
          .json({ error: 'Access request already exists for this patient' });
      }

      // Create access request
      const result = await db.query(
        'INSERT INTO access_requests (clinician_id, patient_id, status, reason) VALUES ($1, $2, $3, $4) RETURNING id, status, created_at',
        [clinicianId, patient_id, 'pending', reason]
      );

      // Log to audit trail
      await db.execute(
        'INSERT INTO audit_logs (action, actor_id, actor_role, target_type, target_id, patient_id, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          'access_request_submitted',
          clinicianId,
          'clinician',
          'access_request',
          result.rows[0].id,
          patient_id,
          req.ip,
          req.headers['user-agent'],
        ]
      );

      // Send notification to patient (if phone number exists)
      if (patient.phone_number) {
        const clinician = await db.getOne(
          'SELECT username FROM users WHERE id = $1',
          [clinicianId]
        );
        await notifications.sendAccessRequestNotification(
          patient.phone_number,
          clinician.username
        );
      }

      res.status(201).json({
        message: 'Access request submitted',
        request: result.rows[0],
      });
    } catch (error) {
      console.error('Access request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /clinician/records/upload
 * Upload a medical record (only if access is approved)
 */
router.post(
  '/clinician/records/upload',
  auth.authenticate,
  auth.requireRole('clinician'),
  upload.handleFileUpload,
  async (req, res) => {
    try {
      const { patient_id, title, description } = req.body;
      const clinicianId = req.user.id;
      const file = req.file;

      if (!patient_id || !title) {
        // Delete uploaded file if validation fails
        if (file) {
          fs.unlinkSync(file.path);
        }
        return res
          .status(400)
          .json({ error: 'Missing required fields: patient_id, title' });
      }

      // Check if clinician has approved access
      const accessRequest = await db.getOne(
        'SELECT status FROM access_requests WHERE clinician_id = $1 AND patient_id = $2',
        [clinicianId, patient_id]
      );

      if (!accessRequest || accessRequest.status !== 'approved') {
        // Delete uploaded file if access not approved
        if (file) {
          fs.unlinkSync(file.path);
        }
        return res.status(403).json({
          error: 'Access not approved. Submit an access request first.',
        });
      }

      // Verify patient exists
      const patient = await db.getOne(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [patient_id, 'patient']
      );

      if (!patient) {
        // Delete uploaded file
        if (file) {
          fs.unlinkSync(file.path);
        }
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Insert record
      const result = await db.query(
        `INSERT INTO records (patient_id, clinician_id, title, description, file_path, file_name, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, title, created_at`,
        [
          patient_id,
          clinicianId,
          title,
          description || null,
          file.path,
          file.originalname,
          file.size,
          file.mimetype,
        ]
      );

      // Log to audit trail
      await db.execute(
        `INSERT INTO audit_logs (action, actor_id, actor_role, target_type, target_id, record_id, patient_id, changes, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'file_uploaded',
          clinicianId,
          'clinician',
          'record',
          result.rows[0].id,
          result.rows[0].id,
          patient_id,
          JSON.stringify({ title, description, fileName: file.originalname }),
          req.ip,
          req.headers['user-agent'],
        ]
      );

      res.status(201).json({
        message: 'File uploaded successfully',
        record: result.rows[0],
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /clinician/records/:recordId
 * Update a medical record (only clinician who uploaded it)
 */
router.put(
  '/clinician/records/:recordId',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const recordId = req.params.recordId;
      const clinicianId = req.user.id;
      const { title, description } = req.body;

      // Verify record belongs to this clinician
      const record = await db.getOne(
        'SELECT id, patient_id FROM records WHERE id = $1 AND clinician_id = $2',
        [recordId, clinicianId]
      );

      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      // Update record
      await db.execute(
        'UPDATE records SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [title || null, description || null, recordId]
      );

      // Log to audit trail
      await db.execute(
        `INSERT INTO audit_logs (action, actor_id, actor_role, target_type, target_id, record_id, patient_id, changes, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'record_updated',
          clinicianId,
          'clinician',
          'record',
          recordId,
          recordId,
          record.patient_id,
          JSON.stringify({ title, description }),
          req.ip,
          req.headers['user-agent'],
        ]
      );

      res.json({
        message: 'Record updated successfully',
        recordId,
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /clinician/records/:recordId
 * Delete a medical record (only clinician who uploaded it)
 */
router.delete(
  '/clinician/records/:recordId',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const recordId = req.params.recordId;
      const clinicianId = req.user.id;

      // Verify record belongs to this clinician
      const record = await db.getOne(
        'SELECT id, file_path, patient_id FROM records WHERE id = $1 AND clinician_id = $2',
        [recordId, clinicianId]
      );

      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }

      // Delete file from disk
      if (fs.existsSync(record.file_path)) {
        fs.unlinkSync(record.file_path);
      }

      // Delete record
      await db.execute('DELETE FROM records WHERE id = $1', [recordId]);

      // Log to audit trail
      await db.execute(
        `INSERT INTO audit_logs (action, actor_id, actor_role, target_type, target_id, record_id, patient_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          'record_deleted',
          clinicianId,
          'clinician',
          'record',
          recordId,
          recordId,
          record.patient_id,
          req.ip,
          req.headers['user-agent'],
        ]
      );

      res.json({
        message: 'Record deleted successfully',
        recordId,
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ============================================================================
// ACCESS REQUEST MANAGEMENT ENDPOINTS (PATIENT)
// ============================================================================

/**
 * PUT /patient/access-requests/:requestId/approve
 * Approve an access request
 */
router.put(
  '/patient/access-requests/:requestId/approve',
  auth.authenticate,
  auth.requireRole('patient'),
  async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const patientId = req.user.id;

      // Verify access request belongs to patient
      const accessRequest = await db.getOne(
        'SELECT id, clinician_id, status FROM access_requests WHERE id = $1 AND patient_id = $2',
        [requestId, patientId]
      );

      if (!accessRequest) {
        return res.status(404).json({ error: 'Access request not found' });
      }

      if (accessRequest.status !== 'pending') {
        return res
          .status(409)
          .json({ error: 'Access request is not pending' });
      }

      // Update status
      await db.execute(
        'UPDATE access_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['approved', requestId]
      );

      // Log to audit trail
      await db.execute(
        `INSERT INTO audit_logs (action, actor_id, actor_role, target_type, target_id, patient_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'access_approved',
          patientId,
          'patient',
          'access_request',
          requestId,
          patientId,
          req.ip,
          req.headers['user-agent'],
        ]
      );

      // Send notification to clinician
      const clinician = await db.getOne(
        'SELECT phone_number FROM users WHERE id = $1',
        [accessRequest.clinician_id]
      );

      if (clinician?.phone_number) {
        const patient = await db.getOne(
          'SELECT username FROM users WHERE id = $1',
          [patientId]
        );
        await notifications.sendAccessApprovedNotification(
          clinician.phone_number,
          patient.username
        );
      }

      res.json({
        message: 'Access request approved',
        requestId,
      });
    } catch (error) {
      console.error('Approve error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /patient/access-requests/:requestId/reject
 * Reject an access request
 */
router.put(
  '/patient/access-requests/:requestId/reject',
  auth.authenticate,
  auth.requireRole('patient'),
  async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const patientId = req.user.id;

      // Verify access request belongs to patient
      const accessRequest = await db.getOne(
        'SELECT id, clinician_id, status FROM access_requests WHERE id = $1 AND patient_id = $2',
        [requestId, patientId]
      );

      if (!accessRequest) {
        return res.status(404).json({ error: 'Access request not found' });
      }

      if (accessRequest.status !== 'pending') {
        return res
          .status(409)
          .json({ error: 'Access request is not pending' });
      }

      // Update status
      await db.execute(
        'UPDATE access_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['rejected', requestId]
      );

      // Log to audit trail
      await db.execute(
        `INSERT INTO audit_logs (action, actor_id, actor_role, target_type, target_id, patient_id, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'access_rejected',
          patientId,
          'patient',
          'access_request',
          requestId,
          patientId,
          req.ip,
          req.headers['user-agent'],
        ]
      );

      // Send notification to clinician
      const clinician = await db.getOne(
        'SELECT phone_number FROM users WHERE id = $1',
        [accessRequest.clinician_id]
      );

      if (clinician?.phone_number) {
        const patient = await db.getOne(
          'SELECT username FROM users WHERE id = $1',
          [patientId]
        );
        await notifications.sendAccessRejectedNotification(
          clinician.phone_number,
          patient.username
        );
      }

      res.json({
        message: 'Access request rejected',
        requestId,
      });
    } catch (error) {
      console.error('Reject error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ============================================================================
// AUDIT LOGS ENDPOINTS (ADMIN/CLINICIAN)
// ============================================================================

/**
 * GET /audit-logs
 * Get audit logs (clinician can see logs for their patients)
 */
router.get(
  '/audit-logs',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const clinicianId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      // Get audit logs for records uploaded by this clinician
      const logs = await db.getAll(
        `SELECT al.* FROM audit_logs al
         WHERE al.actor_id = $1
         ORDER BY al.created_at DESC
         LIMIT $2 OFFSET $3`,
        [clinicianId, limit, offset]
      );

      const countResult = await db.getOne(
        'SELECT COUNT(*) as count FROM audit_logs WHERE actor_id = $1',
        [clinicianId]
      );

      res.json({
        logs,
        total: parseInt(countResult.count),
        limit,
        offset,
      });
    } catch (error) {
      console.error('Audit logs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ============================================================================
// APPOINTMENT REMINDERS ENDPOINTS
// ============================================================================

/**
 * POST /reminders/schedule
 * Schedule an appointment reminder
 */
router.post(
  '/reminders/schedule',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const { patient_id, appointment_date, appointment_description } = req.body;

      if (!patient_id || !appointment_date) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: patient_id, appointment_date' });
      }

      // Verify patient exists and clinician has access
      const accessRequest = await db.getOne(
        'SELECT status FROM access_requests WHERE clinician_id = $1 AND patient_id = $2',
        [req.user.id, patient_id]
      );

      if (!accessRequest || accessRequest.status !== 'approved') {
        return res
          .status(403)
          .json({ error: 'You do not have access to this patient' });
      }

      // Schedule reminder
      const result = await db.query(
        `INSERT INTO reminders (patient_id, appointment_date, appointment_description)
         VALUES ($1, $2, $3)
         RETURNING id, appointment_date, appointment_description`,
        [patient_id, appointment_date, appointment_description || null]
      );

      res.status(201).json({
        message: 'Reminder scheduled successfully',
        reminder: result.rows[0],
      });
    } catch (error) {
      console.error('Schedule reminder error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /reminders/pending
 * Get pending reminders to send (for background job)
 */
router.get(
  '/reminders/pending',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      // Get reminders where appointment is within next 24 hours
      const reminders = await db.getAll(
        `SELECT r.*, u.phone_number, u.username
         FROM reminders r
         JOIN users u ON r.patient_id = u.id
         WHERE r.reminder_sent = FALSE
         AND r.appointment_date <= NOW() + INTERVAL '24 hours'
         AND r.appointment_date > NOW()`,
        []
      );

      res.json({
        reminders,
        count: reminders.length,
      });
    } catch (error) {
      console.error('Get pending reminders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /reminders/:reminderId/send
 * Mark reminder as sent after sending SMS
 */
router.put(
  '/reminders/:reminderId/send',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const reminderId = req.params.reminderId;

      await db.execute(
        'UPDATE reminders SET reminder_sent = TRUE, sent_at = CURRENT_TIMESTAMP WHERE id = $1',
        [reminderId]
      );

      res.json({
        message: 'Reminder marked as sent',
        reminderId,
      });
    } catch (error) {
      console.error('Mark reminder sent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ============================================================================
// DOCTOR NOTES ENDPOINTS
// ============================================================================

/**
 * POST /notes/add
 * Add a doctor note (provider/clinician only)
 */
router.post(
  '/notes/add',
  auth.authenticate,
  auth.requireRole('clinician'),
  async (req, res) => {
    try {
      const { patient_username, note, appointment_date, reminder } = req.body;
      const providerId = req.user.id;

      // Validate input
      if (!patient_username || !note) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: patient_username, note' });
      }

      // Find patient by username
      const patient = await db.getOne(
        'SELECT id, phone_number FROM users WHERE username = $1 AND role = $2',
        [patient_username, 'patient']
      );

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Insert doctor note
      const result = await db.query(
        `INSERT INTO doctor_notes (patient_user_id, provider_user_id, note, appointment_date, reminder)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, patient_user_id, provider_user_id, note, appointment_date, reminder, created_at`,
        [patient.id, providerId, note, appointment_date || null, reminder ? 1 : 0]
      );

      res.status(201).json({
        message: 'Doctor note added successfully',
        note: result.rows[0],
      });
    } catch (error) {
      console.error('Add note error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /notes/me
 * Get doctor notes for authenticated patient
 */
router.get(
  '/notes/me',
  auth.authenticate,
  auth.requireRole('patient'),
  async (req, res) => {
    try {
      const patientId = req.user.id;

      // Get all notes for this patient, ordered by appointment date descending
      const notes = await db.getAll(
        `SELECT dn.id, dn.note, dn.appointment_date, dn.reminder, dn.reminder_sent, 
                dn.created_at, u.username as provider_name, u.email as provider_email
         FROM doctor_notes dn
         JOIN users u ON dn.provider_user_id = u.id
         WHERE dn.patient_user_id = $1
         ORDER BY dn.appointment_date DESC`,
        [patientId]
      );

      res.json({
        notes,
        count: notes.length,
      });
    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
