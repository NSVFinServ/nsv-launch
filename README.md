# NSV FinServ Web Application

A full-stack web application for NSV FinServ, providing loan services, referrals, admin dashboard, and more.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Database Setup (Hostinger)](#database-setup-hostinger)
- [Contributing](#contributing)

## Features
- User signup/login (JWT-based)
- Loan application and eligibility calculator
- Referral system
- Admin dashboard (manage users, referrals, reviews, etc.)
- Customer reviews and testimonial videos
- Regulatory updates and events

## Project Structure
```
backend/    # Node.js Express API
src/        # React frontend (Vite + TypeScript)
```

## Setup Instructions

### 1. Clone the Repository
```
git clone https://github.com/YOUR_ORG/nsv-finserv.git
cd nsv-finserv
```

### 2. Install Dependencies
#### Backend
```
cd backend
npm install
```
#### Frontend
```
cd ../src
npm install
```

### 3. Environment Variables
- Copy `.env.example` to `.env` in the root and fill in your values.
- Both backend and frontend use environment variables (see below).

### 4. Running Locally
#### Backend
```
cd backend
npm run dev
```
#### Frontend
```
cd ../src
npm run dev
```

## Environment Variables
See `.env.example` for all required variables. Key variables:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (backend DB connection)
- `JWT_SECRET` (backend JWT secret)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS` (backend email)
- `VITE_API_URL` (frontend API base URL)

## Deployment

### Frontend (Vercel)
- Deploy the `src/` folder as a Vercel project.
- Set frontend env variables in Vercel dashboard.

### Backend (Render)
- Deploy the `backend/` folder as a Node.js service on Render.
- Set backend env variables in Render dashboard.
- Ensure CORS allows your frontend domain.

### Database (Hostinger)
- Use Hostinger’s MySQL service.
- Import `schema.sql`, `database-migration.sql`, and `database-updates.sql` in order.
- Update your `.env` with Hostinger DB credentials.

## Database Setup (Hostinger)
1. Log in to Hostinger and create a new MySQL database.
2. Import the SQL files in this order:
   - `schema.sql`
   - `database-migration.sql`
   - `database-updates.sql`
3. Update your backend `.env` with the Hostinger DB credentials.

## Contributing
- All organization owners have admin rights.
- Use feature branches and submit PRs for review.
- Protect `main` branch with required reviews.

---
For any issues, contact the project owners in your GitHub organization.
