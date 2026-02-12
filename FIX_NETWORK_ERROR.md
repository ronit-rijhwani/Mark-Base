# Fix: Network Error When Creating Department

## Problem
Frontend shows "network issue" or "Failed to create department" because it cannot connect to the backend API.

## Backend Status
✅ Backend IS running on port 8000
✅ Backend responds to health check
✅ CORS is configured correctly

## Likely Causes

### 1. Browser Cache Issue
The browser might be caching old API configuration or have connection issues.

**Solution:**
1. In your browser (while on http://localhost:3000)
2. Press `Ctrl + Shift + Delete` (or `Cmd + Shift + Delete` on Mac)
3. Select "Cached images and files"
4. Clear cache
5. Refresh page (`Ctrl + F5` or `Cmd + Shift + R`)
6. Try creating department again

### 2. Browser Blocking Request
Some browsers block mixed content or localhost connections.

**Solution:**
1. Make sure you're using:
   - Chrome, Edge, or Firefox (recommended)
   - NOT Internet Explorer
2. Check browser console for specific error message
3. Look for any security warnings

### 3. Frontend Using Wrong URL
The frontend might be configured to connect to wrong backend URL.

**Verify:**
Frontend should connect to: `http://localhost:8000`

**Fix if needed:**
File: `frontend/src/services/api.js` line 7 should be:
```javascript
const API_BASE_URL = 'http://localhost:8000'
```

### 4. Multiple Backend Instances
You have multiple Python processes running (4 detected). This might cause port conflicts.

**Solution - Kill old backend processes:**

```powershell
# Kill all Python processes
Get-Process python | Stop-Process -Force

# Wait 2 seconds
Start-Sleep 2

# Start fresh backend
cd Markbase/backend
python run.py
```

## QUICK FIX - Try This First

### Step 1: Hard Refresh Browser
1. On http://localhost:3000
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. This forces browser to reload everything fresh

### Step 2: Test in Browser Console
Open browser console (F12) and paste this:

```javascript
fetch('http://localhost:8000/api/admin/departments')
  .then(r => r.json())
  .then(d => console.log('✅ Backend reachable:', d))
  .catch(e => console.error('❌ Error:', e))
```

**If this works:** Backend is reachable, the issue is in the form submission
**If this fails:** Browser can't reach backend

### Step 3: Create Department via Console
If Step 2 works, try creating department directly:

```javascript
fetch('http://localhost:8000/api/admin/departments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    name: 'Electrical Engineering', 
    code: 'EE' 
  })
})
  .then(r => r.json())
  .then(d => {
    console.log('✅ Department created:', d)
    window.location.reload()
  })
  .catch(e => console.error('❌ Error:', e))
```

## Recommended Fix: Restart Everything Clean

```powershell
# 1. Kill all Python and Node processes
Get-Process python | Stop-Process -Force
Get-Process node | Stop-Process -Force

# 2. Wait
Start-Sleep 3

# 3. Start backend (in first terminal)
cd Markbase/backend
python run.py

# 4. Start frontend (in second terminal)
cd Markbase/frontend
npm run dev
```

Then:
1. Open fresh browser tab
2. Go to http://localhost:3000
3. Clear cache (Ctrl + Shift + Delete)
4. Login as admin
5. Try creating department

## Check Network Tab in Browser

1. Open DevTools (F12)
2. Go to "Network" tab
3. Try creating department
4. Look for POST request to `/api/admin/departments`
5. Click on it
6. Check:
   - **Status**: Should be 200 (green)
   - **Response**: Shows created department
   - If status is red: Check error message

Common status codes:
- **Failed** or **CORS error** = CORS/network issue
- **404** = Wrong URL
- **500** = Backend error
- **400** = Validation error (duplicate code)

## If Still Not Working

Check exact error in Console:

```javascript
// Test with full error details
fetch('http://localhost:8000/api/admin/departments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test', code: 'TEST' })
})
.then(async response => {
  const data = await response.json()
  if (!response.ok) {
    console.error('❌ Status:', response.status)
    console.error('❌ Error:', data)
  } else {
    console.log('✅ Success:', data)
  }
})
.catch(error => {
  console.error('❌ Network Error:', error)
  console.error('❌ Error type:', error.name)
  console.error('❌ Error message:', error.message)
})
```

This will show EXACTLY what's wrong!
