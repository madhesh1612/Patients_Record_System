# Google OAuth Setup Guide

## Overview
The application now supports Google OAuth login alongside the existing username/password authentication. Users can:
1. Log in with their existing username/password
2. Register and log in with Google OAuth
3. Auto-create accounts on first Google login

## Setup Steps

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `http://localhost:3000` (if using different port)
     - Your production domain (e.g., `https://yourapp.com`)
   - Add authorized redirect URIs:
     - `http://localhost:5000` (backend)
     - Your production backend URL
5. Copy the **Client ID**

### 2. Configure Frontend

Add your Google Client ID to `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### 3. Configure Backend

Add your Google Client ID to `backend/.env`:

```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

### 4. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` and you should see:
- Username/password login form
- "Continue with Google" button below the login form

## Features

### Google Login Button
- Located on the Login page below the standard login form
- Opens Google OAuth consent screen
- Automatically creates account on first login
- Auto-logs in and redirects to appropriate dashboard

### Auto-Account Creation
When a user logs in with Google for the first time:
- Account is created with:
  - `username` = email prefix (e.g., "john" from "john@gmail.com")
  - `email` = Google email
  - `role` = "patient" (default)
  - `password_hash` = "GOOGLE_OAUTH" (marks as OAuth user)
- User is auto-logged in and redirected to Patient Dashboard
- Note: If username is already taken, a unique username is generated

### Existing User Login
If a user already has an account with the same email:
- Google login succeeds and returns existing user
- User is logged in with JWT token
- User is redirected to their dashboard (based on their role)

### Token Management
- Google OAuth credentials are verified on the backend using `google-auth-library`
- JWT tokens are generated for both traditional and Google OAuth logins
- Tokens are stored in localStorage and used for API authentication

## Backend API Endpoint

### POST /auth/google

**Request:**
```json
{
  "credential": "GOOGLE_ID_TOKEN"
}
```

**Response (Success):**
```json
{
  "message": "Google login successful",
  "user": {
    "id": 3,
    "username": "john",
    "email": "john@gmail.com",
    "role": "patient"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error):**
```json
{
  "error": "Invalid Google credential"
}
```

## Testing

### Manual Testing (with valid Google credential)

1. Visit `http://localhost:5173`
2. Click "Continue with Google"
3. Select or sign in with a Google account
4. You should be redirected to the Patient Dashboard

### Testing without valid Google credentials

The login button requires a valid Google credential from the Google OAuth flow. You cannot test it with a random string. However, you can test the backend endpoint structure is correct by:

1. Verifying the route exists and accepts POST requests
2. Testing error handling with invalid credentials

### Test Traditional Login Still Works

1. Visit `http://localhost:5173`
2. Enter demo credentials:
   - Username: `john_patient`
   - Password: `password123`
3. Click "Sign In"
4. You should be redirected to the Patient Dashboard

## Database

No database schema changes were required. Google OAuth users are stored in the existing `users` table with:
- `username` = email prefix or unique identifier
- `email` = Google email (UNIQUE constraint ensures no duplicates)
- `password_hash` = "GOOGLE_OAUTH"
- `role` = "patient" (default)

## Frontend Changes

1. **main.jsx**: Wrapped App with `<GoogleOAuthProvider>`
2. **LoginPage.jsx**:
   - Added Google login button using `<GoogleLogin>` component
   - Added handlers for successful and failed Google login
   - Integrated with existing authentication flow
3. **utils/api.js**: Added `authAPI.googleLogin()` method

## Backend Changes

1. **routes.js**: Added `POST /auth/google` endpoint with:
   - Google credential verification using `google-auth-library`
   - Automatic user creation on first login
   - JWT token generation
   - Unique username handling

## Packages Added

### Frontend
- `@react-oauth/google`: React component for Google OAuth
- `jwt-decode`: Decode Google ID tokens

### Backend
- `google-auth-library`: Verify Google OAuth tokens

## Security Considerations

1. **Token Verification**: Google ID tokens are verified on the backend using the official library
2. **Email Uniqueness**: Emails are unique in the database, preventing duplicate accounts
3. **Password Security**: Google OAuth users have password_hash = "GOOGLE_OAUTH", preventing password-based login
4. **CORS**: Backend CORS is configured to allow frontend requests from localhost:5173
5. **Environment Variables**: Client IDs are stored in .env files (never hardcoded)

## Troubleshooting

### "Google login failed" error
- Verify `VITE_GOOGLE_CLIENT_ID` is set in `frontend/.env`
- Check that the Client ID is correct
- Verify localhost:5173 is added to authorized origins in Google Cloud Console

### "Invalid Google credential" error
- The backend could not verify the credential
- Verify `GOOGLE_CLIENT_ID` is set correctly in `backend/.env`
- Check that the credential hasn't expired

### Users can't see the Google login button
- Ensure `main.jsx` has `<GoogleOAuthProvider>` wrapping the app
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is not "YOUR_GOOGLE_CLIENT_ID_HERE"

## Next Steps

1. Obtain a Google Client ID from Google Cloud Console
2. Add it to both `frontend/.env` and `backend/.env`
3. Test the Google login flow in your browser
4. Deploy to production and update authorized origins/redirect URIs in Google Cloud Console
