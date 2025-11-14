# 🏥 Patient Record Management System

A complete full-stack healthcare application for managing patient medical records with role-based access control, file uploads, and audit logging.

## 📋 System Architecture

```
Patient Record Management System
├── Frontend (React + Vite)
│   ├── Login Page (Both roles)
│   ├── Patient Dashboard (Read-only records + Access requests)
│   └── Clinician Dashboard (Search + Upload + Audit logs)
├── Backend (Node.js + Express)
│   ├── Authentication (JWT + bcrypt)
│   ├── File Upload (multer)
│   ├── Notifications (Twilio SMS)
│   └── Audit Logging
└── Database (PostgreSQL)
    ├── users (Patients & Clinicians)
    ├── records (Medical files)
    ├── access_requests (Permission workflow)
    ├── audit_logs (Activity tracking)
    └── reminders (Appointment SMS)
```

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with bcrypt password hashing
- **Role-based access control** (Patient & Clinician roles)
- **Secure token storage** in localStorage
- **Auto-logout** on token expiration

### 👥 User Roles

#### 👤 Patients
- View their own medical records (read-only)
- See pending access requests from clinicians
- Approve or reject clinician access requests
- Download medical records
- Receive SMS appointment reminders

#### 👨‍⚕️ Clinicians
- Search patients by ID
- Submit access requests with reason
- Upload medical records (PDF, DOC, images, etc.)
- Edit record metadata
- Delete records they uploaded
- View audit logs of their activities
- Schedule appointment reminders

### 📋 Core Workflows

#### Access Request Flow
1. Clinician searches for patient → submits access request
2. Patient sees request → approves or rejects
3. If approved → Clinician can upload/edit records
4. All actions logged in audit trail

#### File Upload Workflow
1. Clinician submits form with file + metadata
2. System validates access permission
3. File saved securely to disk
4. Metadata stored in database
5. Action logged in audit_logs table

#### Appointment Reminder Workflow
1. Clinician schedules reminder for patient
2. System tracks appointment date
3. Auto-sends SMS 24h before appointment (Twilio)
4. Reminder marked as sent in database

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v16+)
- **PostgreSQL** (v12+)
- **npm** or **yarn**
- **Twilio Account** (optional - for SMS reminders)

### 1️⃣ Database Setup

#### Option A: Using psql (Command Line)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE patient_records;

# Connect to the new database
\c patient_records

# Import schema (copy-paste content from backend/sql/schema.sql)
```

#### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name it `patient_records`
4. Right-click the new database → Query Tool
5. Open `backend/sql/schema.sql` and execute

**Verify Installation:**
```bash
psql -U postgres -d patient_records -c "\dt"
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
nano .env
# or
code .env  # Open in VS Code
```

**Update these variables in `.env`:**
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=patient_records

JWT_SECRET=your-super-secret-key-here-change-in-production
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional: Twilio SMS configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Start Backend Server:**
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

✅ Server runs on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env (optional - defaults to localhost:5000)
# nano .env
```

**Start Development Server:**
```bash
npm run dev
```

✅ Frontend runs on `http://localhost:5173`

### 4️⃣ Create Demo Users (Optional)

Connect to database and run:

```sql
-- Create patient account
INSERT INTO users (username, email, password_hash, role, phone_number)
VALUES (
  'john_patient',
  'john@example.com',
  '$2b$10$YourHashedPasswordHere',  -- Hash of "password123"
  'patient',
  '+1-555-0101'
);

-- Create clinician account
INSERT INTO users (username, email, password_hash, role, phone_number)
VALUES (
  'dr_smith',
  'dr.smith@example.com',
  '$2b$10$YourHashedPasswordHere',  -- Hash of "password123"
  'clinician',
  '+1-555-0102'
);
```

**Or use the application's registration feature** to create users.

## 🔗 API Endpoints

### Authentication
```
POST /api/auth/register          - Create new account
POST /api/auth/login             - Login and get JWT token
POST /api/auth/verify            - Verify token validity
```

### Patient Endpoints
```
GET  /api/patient/dashboard      - Get records & access requests
GET  /api/patient/records/:id/download - Download record

PUT  /api/patient/access-requests/:id/approve - Approve access
PUT  /api/patient/access-requests/:id/reject  - Reject access
```

### Clinician Endpoints
```
GET  /api/clinician/search/:patientId         - Find patient
POST /api/clinician/access-request            - Request access
POST /api/clinician/records/upload            - Upload record
PUT  /api/clinician/records/:id               - Update record
DELETE /api/clinician/records/:id             - Delete record

GET  /api/audit-logs                          - Get activity logs
POST /api/reminders/schedule                  - Schedule reminder
```

## 📁 Project Structure

### Backend
```
backend/
├── src/
│   ├── server.js          - Express server entry point
│   ├── routes.js          - API endpoints (700+ lines)
│   ├── auth.js            - JWT & bcrypt utilities
│   ├── db.js              - PostgreSQL connection pool
│   ├── uploadFile.js      - Multer file upload config
│   └── notifications.js   - Twilio SMS integration
├── sql/
│   └── schema.sql         - Database tables & indices
├── uploads/               - Stored medical files
├── package.json           - Dependencies
├── .env.example           - Environment template
└── .env                   - Local environment (not in git)
```

### Frontend
```
frontend/
├── src/
│   ├── main.jsx           - React entry point
│   ├── App.jsx            - Router & protected routes
│   ├── index.css          - Global styles
│   ├── pages/
│   │   ├── Login.jsx      - Login/Register page
│   │   ├── PatientDashboard.jsx
│   │   └── ClinicianDashboard.jsx
│   ├── utils/
│   │   └── api.js         - Axios instance & API calls
│   ├── components/        - Reusable components (future)
│   └── styles/
│       └── Dashboard.css  - UI styles
├── public/                - Static assets
├── index.html             - HTML template
├── vite.config.js         - Vite configuration
├── package.json           - Dependencies
├── .env.example           - Environment template
└── .env                   - Local environment (not in git)
```

## 🔐 Security Features

✅ **Password Security**
- Bcrypt hashing with 10 salt rounds
- Never store plain text passwords

✅ **API Security**
- JWT tokens with expiration (24h default)
- Bearer token authentication
- Role-based middleware checks
- CORS protection

✅ **File Security**
- File type validation (whitelist: PDF, DOC, XLSX, images)
- 10MB file size limit
- Unique filenames with timestamp + user ID
- Secure file path storage

✅ **Data Privacy**
- Patients can only see their own records
- Clinicians can only access approved patients
- Audit trail tracks all activities
- SQL injection prevention with parameterized queries

✅ **Access Control**
- Permission-based workflow
- Patient approval required
- Clinician-specific action logging

## 🧪 Testing the System

### Test Scenario 1: Patient Workflow
1. Register as patient: `john_patient` / `password123`
2. Go to Patient Dashboard
3. View medical records (initially empty)
4. View pending access requests (none initially)

### Test Scenario 2: Clinician Workflow
1. Register as clinician: `dr_smith` / `password123`
2. Go to Clinician Dashboard
3. Search for patient ID (use patient ID from previous step)
4. Submit access request with reason
5. Switch to patient account
6. Approve the access request
7. Switch back to clinician account
8. Upload a medical record
9. View audit logs

### Test Scenario 3: File Download
1. As patient, download a record from dashboard
2. Verify file downloads with original filename

## 📊 Database Schema

### users table
```sql
id, username, email, password_hash, role, phone_number, 
created_at, updated_at
```

### records table
```sql
id, patient_id, clinician_id, title, description, file_path, 
file_name, file_size, mime_type, created_at, updated_at
```

### access_requests table
```sql
id, clinician_id, patient_id, status (pending/approved/rejected), 
reason, created_at, updated_at
```

### audit_logs table
```sql
id, action, actor_id, actor_role, target_type, target_id, record_id, 
patient_id, changes (JSONB), ip_address, user_agent, created_at
```

### reminders table
```sql
id, patient_id, appointment_date, appointment_description, 
reminder_sent, sent_at, created_at, updated_at
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** 
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Test with: `psql -U postgres -d patient_records`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:**
- Verify `FRONTEND_URL` in backend `.env`
- Default: `http://localhost:5173`
- Add/modify CORS origins in `backend/src/server.js`

### Module Not Found
```
Cannot find module 'express'
```
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Vite Development Server Won't Start
```
Error: EACCES: permission denied
```
**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart server
npm run dev
```

## 📱 Twilio SMS Setup (Optional)

### Get Twilio Credentials
1. Sign up at [Twilio](https://www.twilio.com)
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Update `.env`:

```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567
```

### SMS Features
- **Access Request Notification**: Patient gets SMS when clinician requests access
- **Access Approved/Rejected**: Clinician gets SMS of patient's decision
- **Appointment Reminders**: SMS sent 24h before appointment

**Note:** Without Twilio credentials, SMS features log to console instead.

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DB_USER=... DB_PASSWORD=... JWT_SECRET=...

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

## 📝 Environment Checklist

Before production:
- [ ] Change `JWT_SECRET` to strong random key
- [ ] Set `NODE_ENV=production`
- [ ] Configure PostgreSQL remote database
- [ ] Add `FRONTEND_URL` for CORS
- [ ] Setup Twilio credentials (if using SMS)
- [ ] Enable HTTPS in production
- [ ] Setup database backups
- [ ] Configure environment variables on host

## 📚 Technologies Used

**Frontend:**
- React 18 - UI framework
- Vite - Build tool
- React Router DOM - Client-side routing
- Axios - HTTP client

**Backend:**
- Node.js - Runtime
- Express - Web framework
- PostgreSQL - Database
- JWT - Authentication
- bcrypt - Password hashing
- Multer - File uploads
- Twilio - SMS notifications

**Database:**
- PostgreSQL 12+
- Connection pooling

## 📄 License

MIT License - Feel free to use this for learning and production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API error messages
3. Check browser console for errors
4. Verify `.env` configuration

## 🎯 Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Patient-to-clinician messaging
- [ ] Advanced search filters
- [ ] Medical record versioning
- [ ] Bulk upload feature
- [ ] Report generation
- [ ] 2FA authentication
- [ ] Integration with EHR systems
- [ ] Mobile app
- [ ] Analytics dashboard

---

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Status:** Production Ready ✅
