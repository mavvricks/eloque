# Eloquente Catering Management System - Setup Guide

I was unable to automatically install dependencies and start the servers due to environment restrictions (Node/NPM not found in my path). Please follow these steps to get the system running.

## Prerequisites
- Node.js (v18+)
- NPM

## 1. Backend Setup
Open a terminal in the `server` directory:
```bash
cd server
npm install
npm run init-db  # Initialize the SQLite database and seed users
npm run dev      # Start the backend server on port 3000
```

## 2. Frontend Setup
Open a **new** terminal in the `client` directory:
```bash
cd client
npm install
npm run dev      # Start the frontend dev server
```

## 3. Verification
Access the frontend (usually http://localhost:5173).
Use the demo credentials:
- **Operations**: `ops` / `password123` -> Should redirect to Ops Dashboard
- **Admin**: `admin` / `password123` -> Should redirect to Admin Dashboard
- **Client**: `client` / `password123` -> Should redirect to Client Dashboard

## Troubleshooting
- If `better-sqlite3` fails to install, you may need build tools. You can switch to `sqlite3` driver if needed by editing `server/package.json` and `server/db/setup.js`.
