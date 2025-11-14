# 🚀 Quick Start Guide

## 📋 In 5 Minutes

### Prerequisites Check
```bash
node --version        # Should be v16+
npm --version         # Should be v8+
psql --version        # Should be v12+ (PostgreSQL)
```

### Step 1: Backend Setup (1 min)
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=patient_records

JWT_SECRET=change-me-in-production
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Step 2: Database Setup (1 min)
```bash
psql -U postgres
CREATE DATABASE patient_records;
\c patient_records
\i backend/sql/schema.sql
\dt              # Verify tables created
\q              # Exit psql
```

### Step 3: Start Backend (1 min)
```bash
cd backend
npm run dev
```

✅ Server running on http://localhost:5000

### Step 4: Frontend Setup (1 min)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

✅ Frontend running on http://localhost:5173

### Step 5: Test the System (1 min)

**Create Patient Account:**
1. Go to http://localhost:5173
2. Click "Register"
3. Role: Patient
4. Username: john_patient
5. Email: john@example.com
6. Password: password123
7. Click "Create Account"

**Create Clinician Account:**
1. Logout (top right)
2. Click "Register"
3. Role: Clinician
4. Username: dr_smith
5. Email: dr.smith@example.com
6. Password: password123
7. Click "Create Account"

**Test Workflow:**
1. Login as dr_smith (clinician)
2. Find Patient: enter ID (patient's ID)
3. Submit access request
4. Logout → Login as john_patient
5. Approve access request
6. Logout → Login as dr_smith
7. Upload a medical record
8. Logout → Login as john_patient
9. Download the record

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Database credentials & secrets |
| `backend/src/routes.js` | All API endpoints |
| `frontend/src/utils/api.js` | API client setup |
| `README.md` | Full documentation |
| `API_DOCUMENTATION.md` | Endpoint reference |

---

## ⚡ Common Commands

### Backend
```bash
npm run dev              # Start development server
npm start                # Start production server
npm test                 # Run tests (if configured)
```

### Frontend
```bash
npm run dev              # Start dev server with HMR
npm run build            # Build for production
npm run preview          # Preview production build
```

### Database
```bash
psql -U postgres -d patient_records -f backend/sql/schema.sql
psql -U postgres -d patient_records -c "\dt"  # List tables
psql -U postgres -d patient_records -c "SELECT * FROM users;"
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
✓ Solution: Start PostgreSQL and check credentials in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
✓ Solution: Kill process with `lsof -ti:5000 | xargs kill -9` or change PORT

### CORS Error
```
Access-Control-Allow-Origin is missing
```
✓ Solution: Check `FRONTEND_URL` in `backend/.env`

### Module Not Found
```
Cannot find module 'express'
```
✓ Solution: Run `npm install` in the folder

---

## 📊 File Structure Overview

```
patients/
├── backend/
│   ├── src/          ← API code (6 files)
│   ├── sql/          ← Database schema
│   ├── uploads/      ← Medical files
│   └── package.json  ← Dependencies
├── frontend/
│   ├── src/          ← React code (3 pages)
│   ├── public/       ← Static assets
│   └── package.json  ← Dependencies
├── README.md         ← Full guide
└── API_DOCUMENTATION.md
```

---

## 🔐 User Roles

### Patient
- View own records
- Approve/reject access
- Download files

### Clinician
- Search patients
- Request access
- Upload records
- View audit logs

---

## 🎯 API Base URL

All requests go to:
```
http://localhost:5000/api
```

Example:
```bash
POST http://localhost:5000/api/auth/login
GET http://localhost:5000/api/patient/dashboard
POST http://localhost:5000/api/clinician/records/upload
```

---

## 📝 Default Credentials (After Registration)

Patient:
- Username: john_patient
- Password: password123

Clinician:
- Username: dr_smith
- Password: password123

---

## 🔄 Common Workflows

### Workflow 1: Upload a Record
1. Clinician searches patient
2. Submits access request
3. Patient approves
4. Clinician uploads file
5. Patient downloads

### Workflow 2: Schedule Reminder
1. Clinician selects patient
2. Sets appointment date
3. Optional: Send SMS (Twilio)
4. Patient receives reminder

### Workflow 3: Audit Trail
1. Clinician views audit logs
2. See all actions (upload, edit, delete)
3. View actor, timestamp, IP address

---

## 🌐 Endpoints Quick Reference

### Authentication
```
POST /auth/register       - Create account
POST /auth/login          - Login
POST /auth/verify         - Check token
```

### Patient
```
GET  /patient/dashboard         - View dashboard
GET  /patient/records/:id/download
PUT  /patient/access-requests/:id/approve
PUT  /patient/access-requests/:id/reject
```

### Clinician
```
GET  /clinician/search/:patientId
POST /clinician/access-request
POST /clinician/records/upload
PUT  /clinician/records/:id
DELETE /clinician/records/:id
GET  /audit-logs
```

---

## 📚 Documentation

- **README.md** - Complete setup guide
- **API_DOCUMENTATION.md** - All endpoints
- **IMPLEMENTATION_GUIDE.md** - Architecture decisions
- **PROJECT_SUMMARY.md** - Feature overview

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend runs on port 5000
- [ ] Frontend runs on port 5173
- [ ] Database has 5 tables
- [ ] Can register patient account
- [ ] Can register clinician account
- [ ] Can login as both roles
- [ ] Can request access (clinician)
- [ ] Can approve access (patient)
- [ ] Can upload record (clinician)
- [ ] Can view record (patient)
- [ ] Can download file (patient)

---

## 🆘 Need Help?

1. Check `README.md` for detailed instructions
2. Review `API_DOCUMENTATION.md` for endpoint issues
3. Check browser console for errors
4. Check server logs for backend errors
5. Verify `.env` configuration
6. Ensure PostgreSQL is running

---

## 🚀 Next Steps

1. **Start the system** (follow steps above)
2. **Create test accounts** (patient & clinician)
3. **Test workflows** (approval, upload, download)
4. **Review audit logs** (tracking tab)
5. **Customize** (colors, messages, fields)
6. **Deploy** (follow production guide in README)

---

## 📞 Support

**Backend Issues:**
- Check `backend/.env` configuration
- Review server console logs
- Ensure PostgreSQL is running

**Frontend Issues:**
- Clear browser cache
- Check `frontend/.env` configuration
- Open DevTools console (F12)

**Database Issues:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Run schema.sql again if needed

---

## ⏱️ Estimated Time

- **Setup:** 5-10 minutes
- **First test:** 2 minutes
- **Full workflow test:** 10 minutes
- **Customization:** Varies

---

## 🎉 You're Ready!

Your Patient Record Management System is now running! 

Start with http://localhost:5173 and follow the workflows above.

**Happy coding! 🚀**

---

Version: 1.0.0  
Last Updated: November 2024
