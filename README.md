# Proctor Backend

This is the backend for the Video Interview Proctoring System, built with Node.js, TypeScript, Express, and MongoDB.

## Features

- REST API for session, event, and report management
- Real-time socket communication for proctoring events
- MongoDB integration for data storage
- File upload support (video, reports)

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher)
- MongoDB (local or remote instance)

## Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd proctor-project/backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the `backend` directory with the following content:
     ```
     MONGODB_URI=mongodb://localhost:27017/proctor
     PORT=5001
     ```
   - Adjust the values as needed for your environment.

## Usage

### Start the development server

```bash
npm run dev
```

The backend server will run at [http://localhost:5001](http://localhost:5001) by default.

### Build and run in production

```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/session` — Create a new session
- `POST /api/events` — Log detection events
- `POST /api/upload` — Upload video files
- `GET /api/report/:sessionId` — Get proctoring report

## Notes

- Ensure MongoDB is running and accessible before starting the backend.
- The backend must be running for the frontend to function correctly.
- For real-time features, the socket server runs on the same port as the backend.

---

For any issues, please contact the project maintainer.
