# Women Safety Route Prediction Backend

Node.js + Express + MongoDB backend for women safety route prediction.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret.

4. Seed database:
```bash
npm run seed
```

5. Start server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Routes (Protected)
- `POST /api/predictRoute` - Get safest route
  - Body: `{ "source": "Downtown", "destination": "University" }`

### Incidents (Protected)
- `POST /api/reportIncident` - Report incident
  - Body: `{ "location": { "lat": 28.6139, "lng": 77.2090 }, "type": "harassment" }`

### SOS (Protected)
- `POST /api/sos` - Send SOS alert
  - Body: `{ "user_id": "USER_123" }`

## Authentication

Include JWT token in headers:
```
Authorization: Bearer <token>
```
