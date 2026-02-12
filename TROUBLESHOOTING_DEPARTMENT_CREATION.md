# Troubleshooting: "Failed to Create Department" Error

## Problem
When creating a new department in the admin portal, you see "Failed to create department" error.

## Backend Status
✅ Backend API is working correctly - tested via PowerShell and it successfully creates departments.

## Possible Causes

### 1. **Browser Console Error (Most Likely)**
The frontend might be showing a generic error but the real issue is visible in browser console.

**Solution:**
1. Open the admin portal in your browser: `http://localhost:3000`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Try creating a department again
5. Look for red error messages - they will show the actual problem

Common errors you might see:
- CORS error (Cross-Origin Resource Sharing)
- Network error (backend not reachable)
- Authentication error (missing token)
- Validation error (duplicate code)

### 2. **Duplicate Department Code**
If you try to create a department with a code that already exists, it will fail.

**Check existing departments:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/admin/departments" -Method GET -UseBasicParsing
```

**Current departments in database:**
- COMP - Computer Engineering
- IT - Information Technology
- AO - Automation
- Engineering - Computer (wrong order)
- CO - Computer Engineering (duplicate)
- MECH - Mechanical Engineering
- TEST123 - Test Dept

**Solution:** Use a unique department code that doesn't exist yet.

### 3. **Frontend Not Connected to Backend**
The frontend might be trying to connect to wrong URL or backend is not running.

**Check:**
- Backend running on: `http://localhost:8000`
- Frontend running on: `http://localhost:3000`
- Frontend API config in: `frontend/src/services/api.js` (line 7: `const API_BASE_URL = 'http://localhost:8000'`)

**Test connection from frontend:**
Open browser console on `http://localhost:3000` and run:
```javascript
fetch('http://localhost:8000/api/admin/departments')
  .then(r => r.json())
  .then(d => console.log('Departments:', d))
  .catch(e => console.error('Error:', e))
```

### 4. **CORS Configuration**
The backend is configured to allow all origins (`allow_origins=["*"]`), so CORS should not be an issue, but verify.

**Check CORS in browser:**
In Network tab of Developer Tools, check if the request has:
- Response header: `Access-Control-Allow-Origin: *`

If CORS error appears, the backend CORS config is in: `backend/app/main.py` lines 22-28

### 5. **Authentication Issue**
Admin operations might require authentication token.

**Check:**
1. Make sure you're logged in as admin
2. Check localStorage has user token:
   - Open Console in browser
   - Type: `localStorage.getItem('markbase_user')`
   - Should show user object with token

**Solution:** If token is missing, logout and login again.

## Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open `http://localhost:3000`
2. Login as admin
3. Go to Structure → Departments
4. Open Browser DevTools (F12)
5. Go to Console tab
6. Try creating a department
7. **Screenshot the error message**

### Step 2: Check Network Tab
1. In DevTools, go to Network tab
2. Try creating a department
3. Look for the POST request to `/api/admin/departments`
4. Click on it
5. Check:
   - Status code (should be 200 for success)
   - Response (shows error detail)
   - Request payload (shows what you sent)

### Step 3: Test Backend Directly
Open a new browser tab and go to:
```
http://localhost:8000/docs
```

This opens the FastAPI Swagger documentation.

1. Find `POST /api/admin/departments`
2. Click "Try it out"
3. Enter:
   ```json
   {
     "name": "Electronics Engineering",
     "code": "EC"
   }
   ```
4. Click Execute
5. Should return success with department ID

If this works, backend is fine - issue is in frontend.

### Step 4: Check Error Handler
I've updated the error handler to show more details. After refreshing the page:
- Error message will now show actual backend error
- Check browser console for full error object

## Quick Fix: Use Browser Console

While on the admin page, try creating department via console:

```javascript
fetch('http://localhost:8000/api/admin/departments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Civil Engineering', code: 'CIVIL' })
})
.then(r => r.json())
.then(d => {
  console.log('Success:', d)
  window.location.reload() // Refresh page to see new department
})
.catch(e => console.error('Error:', e))
```

## Expected Behavior

**When it works:**
1. Fill department name and code
2. Click "Create"
3. Green success message appears: "Department created successfully!"
4. Form closes
5. New department appears in the table
6. Department count in Overview increases

**When it fails:**
1. Red error message appears with specific reason
2. Check browser console for details

## Common Solutions

### If duplicate code error:
Use a different code (e.g., "ELEC", "MECH", "CIVIL")

### If CORS error:
1. Restart backend server
2. Make sure backend allows all origins (it should)

### If network error:
1. Check backend is running: `http://localhost:8000`
2. Check frontend is running: `http://localhost:3000`

### If authentication error:
1. Logout and login again
2. Check you're logged in as admin (not staff/student)

## Next Steps

1. **Try creating a department with a unique code** (e.g., "ELEC", "CIVIL")
2. **Check browser console** (F12) for the actual error
3. **Report back the error message** you see in console

The backend is confirmed working, so the issue is either:
- Frontend JavaScript error
- Browser console shows the real error
- Duplicate department code

Please check browser console and let me know what error you see!
