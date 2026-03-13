# Complete Women Safety Route Prediction Project - Frontend Development Prompt

## Context
I have a Node.js + Express + MongoDB backend already built. I need you to create a complete React frontend in a new folder called `client/` within the current project directory.

## Existing Backend Structure

### Backend API Endpoints Available:

1. **Authentication (No token required)**
   - `POST /api/auth/register` - Register new user
     - Body: `{ name, email, password, emergency_contacts: [{ name, phone }] }`
     - Response: `{ token, user: { id, name, email } }`
   
   - `POST /api/auth/login` - Login user
     - Body: `{ email, password }`
     - Response: `{ token, user: { id, name, email } }`

2. **Protected Routes (Require JWT token in Authorization header)**
   - `POST /api/predictRoute` - Get safest route
     - Body: `{ source, destination }`
     - Response: `{ route, safety_score }`
   
   - `POST /api/reportIncident` - Report incident
     - Body: `{ location: { lat, lng }, type }`
     - Response: `{ message, incident }`
   
   - `POST /api/sos` - Send SOS alert
     - Body: `{ user_id }`
     - Response: `{ message, notifications }`

### Backend Models:
```javascript
// User Model
{
  user_id: String,
  name: String,
  email: String,
  password_hash: String,
  emergency_contacts: [{ name: String, phone: String }]
}

// Route Model
{
  route_id: String,
  source: String,
  destination: String,
  path_coordinates: [{ lat: Number, lng: Number }],
  safety_score: Number
}

// Incident Model
{
  incident_id: String,
  location: { lat: Number, lng: Number },
  type: String,
  timestamp: Date,
  reported_by: ObjectId
}

// SafeZone Model
{
  zone_id: String,
  location: { lat: Number, lng: Number },
  type: String
}
```

## Frontend Requirements

### Project Setup
Create a React frontend using Vite in a folder called `client/` with the following structure:

```
client/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   └── Dashboard.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

### Page Requirements

#### 1. Register Page (`src/pages/Register.jsx`)
- Form fields:
  - Name (required, min 2 characters)
  - Email (required, valid email format)
  - Password (required, min 6 characters)
  - Emergency Contacts (dynamic array, at least 1 required)
    - Each contact: name (required) + phone (required, 10 digits)
    - Add/Remove contact buttons
- On submit:
  - Validate all fields
  - Call `POST /api/auth/register`
  - Save JWT token to localStorage
  - Redirect to Dashboard
- Show loading state during API call
- Display error messages if API fails
- Link to Login page

#### 2. Login Page (`src/pages/Login.jsx`)
- Form fields:
  - Email (required, valid email format)
  - Password (required)
- On submit:
  - Validate fields
  - Call `POST /api/auth/login`
  - Save JWT token to localStorage
  - Redirect to Dashboard
- Show loading state during API call
- Display error messages (e.g., "Invalid credentials")
- Link to Register page

#### 3. Dashboard Page (`src/pages/Dashboard.jsx`)
- Protected route (redirect to login if no token)
- Display user information:
  - Name
  - Email
  - List of emergency contacts (name + phone)
- Features:
  - **Send SOS Button**: 
    - Calls `POST /api/sos` with user_id
    - Shows success message with notifications sent
    - Shows error if API fails
  - **Report Incident Section** (optional but recommended):
    - Form with location (lat, lng) and type
    - Calls `POST /api/reportIncident`
  - **Predict Route Section** (optional but recommended):
    - Form with source and destination
    - Calls `POST /api/predictRoute`
    - Displays safest route and safety score
- Show loading states for all API calls
- Logout button (clears token, redirects to login)

### Technical Requirements

#### 1. API Service (`src/services/api.js`)
```javascript
// Create axios instance with base URL
// Add interceptor to attach JWT token to all requests
// Export functions for:
// - authAPI.register(data)
// - authAPI.login(data)
// - userAPI.sendSOS(user_id)
// - userAPI.reportIncident(data)
// - userAPI.predictRoute(data)
```

#### 2. Routing (`src/App.jsx`)
- Use React Router v6
- Routes:
  - `/` - Redirect to `/login`
  - `/register` - Register page
  - `/login` - Login page
  - `/dashboard` - Dashboard page (protected)
- Create ProtectedRoute component that checks for token

#### 3. Navbar Component (`src/components/Navbar.jsx`)
- Show "Register" and "Login" links when not authenticated
- Show "Dashboard" and "Logout" button when authenticated
- Logout clears localStorage and redirects to login

#### 4. Form Validation
- All required fields must be filled
- Email must be valid format
- Password minimum 6 characters
- Phone numbers must be 10 digits
- Show inline error messages below fields
- Disable submit button while loading

#### 5. Styling
- Use clean, minimal CSS (inline styles or separate CSS file)
- Responsive design (mobile-friendly)
- Color scheme suggestion:
  - Primary: #6366f1 (indigo)
  - Danger: #ef4444 (red)
  - Success: #10b981 (green)
- Form styling:
  - Centered forms with max-width
  - Clear labels and input fields
  - Proper spacing and padding
  - Button hover effects

#### 6. Environment Variables
- Create `.env.example`:
  ```
  VITE_API_BASE_URL=http://localhost:5000/api
  ```
- Use `import.meta.env.VITE_API_BASE_URL` in api.js

#### 7. Error Handling
- Catch all API errors
- Display user-friendly error messages
- Handle network errors
- Handle 401 unauthorized (redirect to login)

#### 8. Loading States
- Show "Loading..." or spinner during API calls
- Disable form submission while loading
- Prevent multiple submissions

### Package.json Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### Additional Features (Nice to Have)
1. Toast notifications for success/error messages
2. Form field icons (email icon, password eye icon)
3. Confirmation dialog before sending SOS
4. Display timestamp for last SOS sent
5. Map integration for route visualization (future enhancement)

## Deliverables

Please create the complete React frontend with:

1. ✅ All page components (Register, Login, Dashboard)
2. ✅ Navbar component
3. ✅ API service with axios
4. ✅ React Router setup with protected routes
5. ✅ Form validation on all forms
6. ✅ Loading states and error handling
7. ✅ Clean, responsive CSS styling
8. ✅ Environment variable configuration
9. ✅ Complete package.json with all dependencies
10. ✅ Vite configuration
11. ✅ README.md with setup instructions

## Important Notes

- Backend runs on `http://localhost:5000`
- Frontend should run on `http://localhost:5173` (Vite default)
- JWT token format: `Bearer <token>`
- Store token in localStorage with key `'token'`
- All protected API calls need Authorization header
- User object from backend includes: `{ id, name, email }`
- Emergency contacts format: `[{ name: "John Doe", phone: "1234567890" }]`

## Setup Instructions to Include in README

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
```

## Testing Checklist

- [ ] Register new user with emergency contacts
- [ ] Login with registered credentials
- [ ] Dashboard displays user info correctly
- [ ] Send SOS button works and shows response
- [ ] Logout clears token and redirects
- [ ] Protected routes redirect to login when not authenticated
- [ ] Form validation works on all forms
- [ ] Error messages display for invalid API responses
- [ ] Loading states show during API calls
- [ ] Responsive design works on mobile

---

Please create all the files in a new `client/` folder with complete, working code. Make sure the code is production-ready with proper error handling, validation, and clean UI.
