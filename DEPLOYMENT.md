# Deployment Guide

## Overview
This project is configured for deployment with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Hostinger MySQL

## Prerequisites
1. Vercel account
2. Render account  
3. Hostinger MySQL database

## Deployment Steps

### 1. Database Setup (Hostinger)
1. Create a MySQL database in Hostinger
2. Run the SQL scripts in this order:
   ```sql
   -- Run schema.sql first to create tables
   -- Then run database-migration.sql for initial data
   -- Finally run database-updates.sql for latest updates
   ```
3. Note down your database credentials:
   - Host
   - Username
   - Password
   - Database name

### 2. Backend Deployment (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty
4. Add environment variables in Render dashboard:
   ```
   DB_HOST=your-hostinger-mysql-host
   DB_USER=your-mysql-username
   DB_PASSWORD=your-mysql-password
   DB_NAME=your-database-name
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_BASE_URL=https://your-app.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=5000
   ```

### 3. Frontend Deployment (Vercel)
1. Import your project to Vercel
2. Set environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
   ```
3. Deploy

### 4. Post-Deployment
1. Test the database connection using `/api/test-db` endpoint
2. Test email functionality using `/api/test-email` endpoint
3. Verify all features work correctly

## Important Notes
- Make sure your Hostinger MySQL allows external connections
- Update CORS settings in backend if needed
- Use strong JWT secrets in production
- Enable SSL for database connections if available

## Troubleshooting
- If database connection fails, check Hostinger firewall settings
- If CORS errors occur, verify FRONTEND_BASE_URL is correct
- For email issues, ensure Gmail app passwords are used (not regular password)
