# 📚 API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/*`) require a JWT token in the `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response Format
All responses are JSON:
```json
{
  "message": "Success message or error",
  "data": {},
  "error": "Error message (if applicable)"
}
```

---

## 🔐 Authentication Endpoints

### POST `/auth/register`
Create a new user account (patient or clinician).

**Request Body:**
```json
{
  "username": "john_patient",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "patient",
  "phone_number": "+1-555-0101"
}
```

**Required Fields:** `username`, `email`, `password`, `role`  
**Optional Fields:** `phone_number`

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_patient",
    "email": "john@example.com",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Missing required fields
- `409` - Username or email already exists

---

### POST `/auth/login`
Authenticate a user and receive JWT token.

**Request Body:**
```json
{
  "username": "john_patient",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_patient",
    "email": "john@example.com",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Missing username or password
- `401` - Invalid credentials

---

### POST `/auth/verify`
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Token is valid",
  "user": {
    "id": 1,
    "username": "john_patient",
    "role": "patient"
  }
}
```

**Errors:**
- `401` - Invalid or expired token

---

## 👤 Patient Endpoints

### GET `/patient/dashboard`
Get patient's medical records and pending access requests.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** None

**Response (200 OK):**
```json
{
  "records": [
    {
      "id": 1,
      "title": "Blood Work Results",
      "description": "Annual checkup",
      "file_name": "bloodwork.pdf",
      "file_size": 245000,
      "mime_type": "application/pdf",
      "clinician_name": "dr_smith",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "accessRequests": [
    {
      "id": 1,
      "status": "pending",
      "reason": "Need to review patient history for consultation",
      "clinician_name": "dr_jones",
      "clinician_email": "dr.jones@example.com",
      "created_at": "2024-01-14T09:15:00Z"
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Not a patient

---

### GET `/patient/records/:recordId/download`
Download a specific medical record (patient only).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `recordId` (number) - ID of the record to download

**Response:** File binary data

**Errors:**
- `401` - Unauthorized
- `403` - Record doesn't belong to patient
- `404` - Record not found

---

### PUT `/patient/access-requests/:requestId/approve`
Approve a clinician's access request.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `requestId` (number) - ID of the access request

**Response (200 OK):**
```json
{
  "message": "Access request approved",
  "requestId": 1
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Request doesn't belong to patient
- `404` - Request not found
- `409` - Request is not pending

---

### PUT `/patient/access-requests/:requestId/reject`
Reject a clinician's access request.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `requestId` (number) - ID of the access request

**Response (200 OK):**
```json
{
  "message": "Access request rejected",
  "requestId": 1
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Request doesn't belong to patient
- `404` - Request not found
- `409` - Request is not pending

---

## 👨‍⚕️ Clinician Endpoints

### GET `/clinician/search/:patientId`
Search for a patient by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `patientId` (number) - ID of the patient

**Response (200 OK):**
```json
{
  "patient": {
    "id": 1,
    "username": "john_patient",
    "email": "john@example.com"
  },
  "accessStatus": "none"
}
```

**Access Status Values:**
- `none` - No request submitted
- `pending` - Request waiting for patient approval
- `approved` - Access granted
- `rejected` - Access denied

**Errors:**
- `401` - Unauthorized
- `403` - Not a clinician
- `404` - Patient not found

---

### POST `/clinician/access-request`
Submit access request to patient's records.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_id": 1,
  "reason": "Need to review patient history for upcoming consultation"
}
```

**Response (201 Created):**
```json
{
  "message": "Access request submitted",
  "request": {
    "id": 1,
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized
- `403` - Not a clinician
- `404` - Patient not found
- `409` - Access request already exists

---

### POST `/clinician/records/upload`
Upload a medical record (requires approved access).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `patient_id` (number) - Patient ID
- `title` (string) - Record title
- `description` (string, optional) - Record description
- `file` (file) - Medical document

**Allowed File Types:**
- PDF (.pdf)
- Images (.jpg, .jpeg, .png)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)

**Max File Size:** 10MB

**Response (201 Created):**
```json
{
  "message": "File uploaded successfully",
  "record": {
    "id": 1,
    "title": "Blood Work Results",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Missing fields or invalid file
- `401` - Unauthorized
- `403` - Access not approved or not a clinician
- `404` - Patient not found

---

### PUT `/clinician/records/:recordId`
Update a medical record (clinician who uploaded it only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `recordId` (number) - ID of the record

**Request Body:**
```json
{
  "title": "Updated Blood Work Results",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "message": "Record updated successfully",
  "recordId": 1
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Record doesn't belong to clinician
- `404` - Record not found

---

### DELETE `/clinician/records/:recordId`
Delete a medical record (clinician who uploaded it only).

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `recordId` (number) - ID of the record

**Response (200 OK):**
```json
{
  "message": "Record deleted successfully",
  "recordId": 1
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Record doesn't belong to clinician
- `404` - Record not found

---

## 📋 Audit Logs Endpoints

### GET `/audit-logs`
Get audit logs for clinician's activities (paginated).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (number, optional) - Results per page (default: 50)
- `offset` (number, optional) - Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 1,
      "action": "file_uploaded",
      "actor_id": 2,
      "actor_role": "clinician",
      "target_type": "record",
      "target_id": 1,
      "record_id": 1,
      "patient_id": 1,
      "changes": {
        "title": "Blood Work Results",
        "fileName": "bloodwork.pdf"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

**Audit Log Actions:**
- `access_request_submitted` - Clinician submitted access request
- `access_approved` - Patient approved access
- `access_rejected` - Patient rejected access
- `file_uploaded` - Record uploaded
- `record_updated` - Record metadata updated
- `record_deleted` - Record deleted

**Errors:**
- `401` - Unauthorized
- `403` - Not a clinician

---

## 🔔 Reminders Endpoints

### POST `/reminders/schedule`
Schedule an appointment reminder (requires approved access).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_id": 1,
  "appointment_date": "2024-02-15T14:30:00Z",
  "appointment_description": "Annual checkup with Dr. Smith"
}
```

**Response (201 Created):**
```json
{
  "message": "Reminder scheduled successfully",
  "reminder": {
    "id": 1,
    "appointment_date": "2024-02-15T14:30:00Z",
    "appointment_description": "Annual checkup with Dr. Smith"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized
- `403` - No access to patient or not a clinician
- `404` - Patient not found

---

### GET `/reminders/pending`
Get reminders to send (within 24 hours).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "reminders": [
    {
      "id": 1,
      "patient_id": 1,
      "appointment_date": "2024-01-16T14:30:00Z",
      "appointment_description": "Annual checkup",
      "phone_number": "+1-555-0101",
      "username": "john_patient"
    }
  ],
  "count": 1
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Not a clinician

---

### PUT `/reminders/:reminderId/send`
Mark reminder as sent after SMS delivery.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `reminderId` (number) - ID of the reminder

**Response (200 OK):**
```json
{
  "message": "Reminder marked as sent",
  "reminderId": 1
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Not a clinician

---

## ⚠️ Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate, already exists)
- `500` - Server Error

### Error Response Example
```json
{
  "error": "Patient not found"
}
```

---

## 🔒 Security Notes

1. **Token Storage:** Store tokens securely (httpOnly cookies preferred)
2. **Token Expiration:** Default 24 hours
3. **Rate Limiting:** Consider implementing in production
4. **HTTPS:** Use HTTPS in production
5. **CORS:** Frontend URL must be whitelisted
6. **SQL Injection:** All queries use parameterized statements
7. **File Uploads:** Validated file types and size limits

---

## 📝 Example Requests (cURL)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_patient",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_patient",
    "password": "password123"
  }'
```

### Get Dashboard (Patient)
```bash
curl -X GET http://localhost:5000/api/patient/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload Record (Clinician)
```bash
curl -X POST http://localhost:5000/api/clinician/records/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "patient_id=1" \
  -F "title=Blood Work" \
  -F "description=Annual checkup" \
  -F "file=@/path/to/file.pdf"
```

---

**API Version:** 1.0.0  
**Last Updated:** November 2024
