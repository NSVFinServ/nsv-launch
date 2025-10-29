require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const otpGenerator = require('otp-generator');

const app = express();
const PORT = process.env.PORT || 10000;

// 1) Trust proxy (Render/HTTPS)
// ---- Proxy & CORS (final strict allow-list) ----
/* ------------------------ CORS Allow-List (clean) ------------------------- */
app.set('trust proxy', 1);

// Normalize an origin to "protocol://host[:port]" (no path/trailing slash)
const normalize = (o) => {
  try {
    const u = new URL(o);
    return `${u.protocol}//${u.host}`;
  } catch {
    return String(o || '').trim().replace(/\/+$/,'').toLowerCase();
  }
};

// Read env and normalize
const rawOrigins = [
  process.env.FRONTEND_BASE_URL,
  ...(process.env.FRONTEND_BASE_URLS || '').split(',')
].map(s => (s || '').trim()).filter(Boolean);

// Build exact allow-list, then convert to a Set
const allowedOriginList = [
  ...rawOrigins.map(normalize),
  'https://www.nsvfinserv.com',
  'https://nsvfinserv.com',
  'http://localhost:5173',
];

const allowedOriginsSet = new Set(allowedOriginList);

const corsOptions = {
  origin: (origin, cb) => {
    // Non-browser clients (no Origin header) — allow
    if (!origin) return cb(null, true);

    const o = normalize(origin);

    // Always allow any Vercel preview/production domain
    try {
      const host = new URL(o).host.toLowerCase();
      if (host.endsWith('.vercel.app')) return cb(null, true);
    } catch { /* ignore parse errors */ }

    // Exact match against our Set
    if (allowedOriginsSet.has(o)) return cb(null, true);

    console.warn('CORS blocked for origin:', origin, 'Allowed list:', allowedOriginList);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
};

// Mount ONCE (remove any duplicate cors/app.options you had before)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// ---------- Health endpoints ----------
app.get('/', (req, res) => res.type('text/plain').send('NSV Finserv API. See /api/health'));
app.get('/api', (req, res) => res.json({ ok: true, msg: 'API base. Try /api/health' }));
app.get('/api/health', (req, res) => res.status(200).json({ ok: true, time: Date.now() }));

// ---------- Global error handler (JSON, not HTML) ----------
app.use((err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err && err.stack ? err.stack : err);
  if (res.headersSent) return;
  res
    .status(500)
    .type('application/json')
    .send(JSON.stringify({ error: 'internal_error', message: err?.message || 'Server error' }));
});

// ---------- Multer (unchanged) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});
// ---- Your DB pool + routes continue below (leave them as-is) ----

// MySQL Connection Pool with proper configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeout: 300000,
  supportBigNumbers: true,
  bigNumberStrings: true
});

// Create a promise-based wrapper for the pool
const promisePool = pool.promise();

// Test the connection pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.error('Make sure your database credentials are correct in .env file');
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// Handle pool errors gracefully
pool.on('error', function(err) {
  console.error('Database pool error:', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
  } else {
    throw err;
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Email configuration - Use environment variables for real email system
const transporter = require('nodemailer').createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    console.log('Attempting to send email to:', to);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log('Email sent to:', to);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', error.message);
    
    // If it's an authentication error, provide helpful message
    if (error.message.includes('Invalid login') || error.message.includes('authentication') || error.message.includes('535')) {
      console.error('Gmail authentication failed. Please check:');
      console.error('1. Gmail account is correct');
      console.error('2. App Password is correct (not regular password)');
      console.error('3. 2-Factor Authentication is enabled');
      console.error('4. App Password is generated correctly');
    }
    
    return false;
  }
};

// Helper function to generate OTP
const generateOTP = () => {
  return otpGenerator.generate(6, { 
    upperCaseAlphabets: false, 
    lowerCaseAlphabets: false, 
    specialChars: false 
  });
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Routes

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    // Test basic connection
    const [result] = await promisePool.query('SELECT 1 as test');
    
    // Check if database exists
    const [databases] = await promisePool.query('SHOW DATABASES LIKE "nsv"');
    
    // Check if tables exist
    const [tables] = await promisePool.query('SHOW TABLES');
    
    res.json({
      message: 'Database connection successful',
      connectionTest: result,
      databaseExists: databases.length > 0,
      tables: tables.map(t => Object.values(t)[0]),
      tablesCount: tables.length
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
      code: error.code
    });
  }
});

// Test endpoint for email
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const testHtml = `
      <h2>NSV FinServ - Test Email</h2>
      <p>This is a test email to verify email functionality.</p>
      <p>If you receive this, the email system is working correctly!</p>
      <p>Time: ${new Date().toLocaleString()}</p>
    `;
    
    const emailSent = await sendEmail(email, 'NSV FinServ - Test Email', testHtml);
    
    if (emailSent) {
      res.json({ message: 'Test email sent successfully!', email: email });
    } else {
      res.status(500).json({ message: 'Failed to send test email' });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ message: 'Error sending test email' });
  }
});

// 1. User Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if user already exists
    const [existingUser] = await promisePool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await promisePool.query(
      'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone]
    );
    
    const token = generateToken(result.insertId);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, name, email, phone }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// ---------- Admin guard (uses your existing admin token shape) ----------
const isAdmin = (req, res, next) => {
  // Your admin login issues token with { userId: 'admin' }
  if (req?.user?.userId === 'admin') return next();
  return res.status(403).json({ error: 'admin_only' });
};

// ---------- Admin: View one user ----------
app.get('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await promisePool.query(
      'SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Admin view user error:', err);
    return res.status(500).json({ error: 'failed_to_get_user' });
  }
});

// ---------- Admin: Edit/Update user (name/email/phone and optional password reset) ----------
app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, newPassword } = req.body || {};

    // Ensure user exists
    const [existing] = await promisePool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

    // Enforce unique email/phone if provided
    if (email || phone) {
      const [dup] = await promisePool.query(
        'SELECT id FROM users WHERE (email = ? OR phone = ?) AND id <> ? LIMIT 1',
        [email || null, phone || null, id]
      );
      if (dup.length > 0) {
        return res.status(400).json({ error: 'Email or phone already in use by another user' });
      }
    }

    // Build dynamic update set
    const fields = [];
    const params = [];

    if (typeof name === 'string' && name.trim()) { fields.push('name = ?'); params.push(name.trim()); }
    if (typeof email === 'string' && email.trim()) { fields.push('email = ?'); params.push(email.trim().toLowerCase()); }
    if (typeof phone === 'string' && phone.trim()) { fields.push('phone = ?'); params.push(phone.trim()); }

    // Optional password reset
    if (typeof newPassword === 'string' && newPassword.length >= 6) {
      const hash = await bcrypt.hash(newPassword, 10);
      fields.push('password_hash = ?');
      params.push(hash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    fields.push('updated_at = NOW()');
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    await promisePool.query(sql, params);

    // Return the updated user (without password hash)
    const [updated] = await promisePool.query(
      'SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return res.json({ message: 'User updated successfully', user: updated[0] });
  } catch (err) {
    console.error('Admin update user error:', err);
    return res.status(500).json({ error: 'failed_to_update_user' });
  }
});

// ---------- Admin: Delete user ----------
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // (Optional) safeguard: prevent deleting special/system users
    // if (String(id) === '1') return res.status(400).json({ error: 'Cannot delete system user' });

    const [result] = await promisePool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return res.status(500).json({ error: 'failed_to_delete_user' });
  }
});

// 2. User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Special admin login check
    if (email === 'admin@nsvfinserv.com' && password === 'password') {
      const token = generateToken('admin');
      return res.json({
        message: 'Admin login successful',
        token,
        user: { id: 'admin', name: 'Admin', email: 'admin@nsvfinserv.com', phone: '0000000000' }
      });
    }
    
    // Find user
    const [users] = await promisePool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Submit Referral
app.post('/api/referral', async (req, res) => {
  try {
    const { referrer_id, referred_name, referred_email, referred_phone } = req.body;
    
    // Insert referral
    const [result] = await promisePool.query(
      'INSERT INTO referrals (referrer_id, referred_name, referred_email, referred_phone) VALUES (?, ?, ?, ?)',
      [referrer_id, referred_name, referred_email, referred_phone]
    );
    
    res.status(201).json({
      message: 'Referral submitted successfully',
      referral_id: result.insertId
    });
  } catch (error) {
    console.error('Referral error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. Submit Loan Application
// -------------------- Loan Applications (singular) --------------------
const createLoanApplication = async (req, res) => {
  try {
    const { user_id, service_id, amount, ask_expert_id } = req.body || {};

    // Basic validation
    if (!user_id || !service_id || !amount) {
      return res
        .status(400)
        .json({ ok: false, error: 'Missing required fields: user_id, service_id, amount' });
    }

    // Insert into table with columns: user_id, service_id, amount, ask_expert_id (nullable)
    await promisePool.execute(
      'INSERT INTO loan_applications (user_id, service_id, amount, ask_expert_id) VALUES (?, ?, ?, ?)',
      [user_id, service_id, amount, ask_expert_id ?? null]
    );

    return res.status(201).json({ ok: true, message: 'Application received' });
  } catch (err) {
    console.error('❌ Loan application error:', err);
    return res.status(500).json({ ok: false, error: 'create_loan_failed' });
  }
};

// Primary route (keep this)
app.post('/api/loan-application', createLoanApplication);

// // Back-compat aliases (so existing frontends won’t 404)
// app.post('/api/loan/apply', createLoanApplication);
// app.post('/api/loan-applications', createLoanApplication);


// 5. Get Services
app.get('/api/services', async (req, res) => {
  try {
    const [services] = await promisePool.query('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 6. Get All Users (for admin view)
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await promisePool.query('SELECT id, name, email, phone, created_at FROM users');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 7. Get All Referrals (for admin view)
app.get('/api/referrals', async (req, res) => {
  try {
    const [referrals] = await promisePool.query(`
      SELECT 
        r.*, 
        u.name as referrer_name,
        u.email as referrer_email,
        u.phone as referrer_phone
      FROM referrals r 
      JOIN users u ON r.referrer_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(referrals);
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 8. Get All Loan Applications (for admin view)
app.get('/api/loan-applications', async (req, res) => {
  try {
    const [applications] = await promisePool.query(`
      SELECT la.*, u.name as user_name, u.email as user_email, s.name as service_name
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      JOIN services s ON la.service_id = s.id
    `);
    res.json(applications);
  } catch (error) {
    console.error('Get loan applications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 9. Ask Expert Question
app.post('/api/ask-expert', async (req, res) => {
  try {
    const { user_id, question } = req.body;
    
    const [result] = await promisePool.query(
      'INSERT INTO ask_expert (user_id, question) VALUES (?, ?)',
      [user_id, question]
    );
    
    res.status(201).json({
      message: 'Question submitted successfully',
      question_id: result.insertId
    });
  } catch (error) {
    console.error('Ask expert error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 10. Track Website Analytics
app.post('/api/track-click', async (req, res) => {
  try {
    // Accept both flat and nested { page: { ... } } payloads
    const raw = (req && req.body) || {};
    const src = (raw && typeof raw.page === 'object' && raw.page !== null)
      ? raw.page
      : raw;

    const page   = typeof src.page === 'string'   ? src.page.trim()   : '';
    const action = typeof src.action === 'string' ? src.action.trim() : '';
    const userId = src.user_id ?? src.userId ?? null;
    const meta   = src.meta ?? null;

    if (!page || !action) {
      console.warn('track-click missing fields (normalized):', { src, raw });
      return res.status(400).json({ ok: false, error: 'Missing required fields: page, action' });
    }

    // TODO: persist to DB if desired (use promisePool)
    // await promisePool.execute('INSERT INTO analytics (page, action, user_id, meta) VALUES (?,?,?,?)',
    //   [page, action, userId, JSON.stringify(meta)]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ ok: false, error: 'analytics_failed' });
  }
});


// 11. Get Website Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const [analytics] = await promisePool.query(`
      SELECT 
        page,
        action,
        COUNT(*) as click_count,
        COUNT(DISTINCT user_id) as unique_users,
        DATE(timestamp) as date
      FROM website_analytics 
      GROUP BY page, action, DATE(timestamp)
      ORDER BY date DESC, click_count DESC
    `);
    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// 12. Get Dashboard Statistics
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const [userStats] = await promisePool.query('SELECT COUNT(*) as total_users FROM users');
    const [referralStats] = await promisePool.query('SELECT COUNT(*) as total_referrals FROM referrals');
    const [applicationStats] = await promisePool.query('SELECT COUNT(*) as total_applications FROM loan_applications');
    const [recentUsers] = await promisePool.query(`
      SELECT COUNT(*) as recent_users 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const [recentApplications] = await promisePool.query(`
      SELECT COUNT(*) as recent_applications 
      FROM loan_applications 
      WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const [totalClicks] = await promisePool.query('SELECT COUNT(*) as total_clicks FROM website_analytics');
    
    res.json({
      totalUsers: userStats[0].total_users,
      totalReferrals: referralStats[0].total_referrals,
      totalApplications: applicationStats[0].total_applications,
      recentUsers: recentUsers[0].recent_users,
      recentApplications: recentApplications[0].recent_applications,
      totalClicks: totalClicks[0].total_clicks
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if email exists
app.post('/api/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await promisePool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    res.json({ 
      exists: users.length > 0,
      message: users.length > 0 ? 'Email found' : 'Email not found'
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Error checking email' });
  }
});

// Check if phone exists
app.post('/api/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    const [users] = await promisePool.query('SELECT id FROM users WHERE phone = ?', [phone]);
    
    res.json({ 
      exists: users.length > 0,
      message: users.length > 0 ? 'Phone found' : 'Phone not found'
    });
  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({ message: 'Error checking phone' });
  }
});

// 13. Forgot Password - Email Method
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, method = 'email' } = req.body;
    
    // Get user info (email already verified to exist by frontend)
    const [users] = await promisePool.query(
      'SELECT id, name, email, phone FROM users WHERE email = ?',
      [email]
    );
    
    const user = users[0];
    
    if (method === 'email') {
      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Store reset token in database
      await promisePool.query(
        'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
        [email, resetToken, new Date(Date.now() + 15 * 60 * 1000)] // 15 minutes
      );
      
      // Send email
      const resetLink = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password for your NSV FinServ account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetLink}</p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>NSV FinServ Team</p>
        </div>
      `;
      
      const emailSent = await sendEmail(email, 'Password Reset - NSV FinServ', emailHtml);
      
      if (emailSent) {
        res.json({ message: 'Password reset link sent to your email' });
      } else {
        res.status(500).json({ message: 'Failed to send email. Please try again.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid method. Use "email" or "otp".' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 13b. Forgot Password - OTP Method
app.post('/api/forgot-password-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Get user info (phone already verified to exist by frontend)
    const [users] = await promisePool.query(
      'SELECT id, name, email, phone FROM users WHERE phone = ?',
      [phone]
    );
    
    const user = users[0];
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStorage.set(phone, {
      otp: otp,
      expires: Date.now() + 5 * 60 * 1000,
      email: user.email
    });
    
    // In a real application, you would send SMS here
    // For now, we'll log it and send via email as backup
    console.log(`OTP for ${phone}: ${otp}`);
    
    // Send OTP via email as backup
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset OTP</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password using OTP for your NSV FinServ account.</p>
        <p>Your OTP is:</p>
        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this message.</p>
        <br>
        <p>Best regards,<br>NSV FinServ Team</p>
      </div>
    `;
    
    await sendEmail(user.email, 'Password Reset OTP - NSV FinServ', emailHtml);
    
    res.json({ 
      message: 'OTP sent to your phone and email',
      otp: otp // Only for development - remove in production
    });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 13c. Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const storedData = otpStorage.get(phone);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }
    
    if (Date.now() > storedData.expires) {
      otpStorage.delete(phone);
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid, generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store reset token in database
    await promisePool.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [storedData.email, resetToken, new Date(Date.now() + 15 * 60 * 1000)]
    );
    
    // Clean up OTP
    otpStorage.delete(phone);
    
    res.json({
      message: 'OTP verified successfully',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 14. Reset Password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify the token exists and is not expired
    const [resetRecords] = await promisePool.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    
    if (resetRecords.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    const resetRecord = resetRecords[0];
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await promisePool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, resetRecord.email]
    );
    
    // Mark token as used
    await promisePool.query(
      'UPDATE password_resets SET used = TRUE WHERE token = ?',
      [token]
    );
    
    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
// Customer Reviews API Endpoints
// Get all approved reviews
app.get('/api/reviews', (req, res) => {
  const query = 'SELECT * FROM customer_reviews WHERE status = "verified" ORDER BY created_at DESC';
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    res.json(results);
  });
});

// Submit a new review
// Submit a new review (enrich from latest loan application)
app.post('/api/reviews', async (req, res) => {
  try {
    const { name, email, phone, rating, reviewText } = req.body;

    if (!name || !email || !rating || !reviewText) {
      return res.status(400).json({ error: 'Name, email, rating, and review text are required' });
    }

    // 1) Find user by email
    const [users] = await promisePool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (users.length === 0) {
      return res.status(400).json({ error: 'No user found for this email. Please sign up / log in first.' });
    }
    const userId = users[0].id;

    // 2) Get latest loan application (join services to get loan type/name)
    const [apps] = await promisePool.query(
      `
        SELECT la.amount, s.name AS service_name
        FROM loan_applications la
        JOIN services s ON s.id = la.service_id
        WHERE la.user_id = ?
        ORDER BY la.submitted_at DESC, la.id DESC
        LIMIT 1
      `,
      [userId]
    );

    const loan_type   = apps.length ? apps[0].service_name : null;
    const loan_amount = apps.length ? apps[0].amount       : null;

    // 3) Insert review into your actual columns (no email column)
    const [result] = await promisePool.query(
      `
        INSERT INTO customer_reviews
          (user_id, name, location, phone, rating, loan_type, loan_amount, review_text, is_approved, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,                 // user_id
        name,                   // name
        null,                   // location (not collected)
        phone || null,          // phone
        rating,                 // rating
        loan_type,              // loan_type (service name) or NULL
        loan_amount,            // loan_amount (from loan_applications) or NULL
        reviewText,             // review_text
        0,                      // is_approved = 0 (false)
        'pending'               // status
      ]
    );

    return res.status(201).json({
      message: 'Review submitted successfully and pending approval',
      id: result.insertId,
      enriched_from_loan: { loan_type, loan_amount }
    });
  } catch (err) {
    console.error('Error submitting review:', err);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});


// Admin: Get all reviews (including unapproved) - Protected endpoint
app.get('/api/admin/reviews', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM customer_reviews ORDER BY created_at DESC';
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
    res.json(results);
  });
});

// Admin: Update review status - Protected endpoint
app.put('/api/admin/reviews/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const query = 'UPDATE customer_reviews SET status = ?, updated_at = NOW() WHERE id = ?';
  
  pool.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating review status:', err);
      return res.status(500).json({ error: 'Failed to update review status' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: `Review ${status} successfully` });
  });
});

// Admin: Delete review - Protected endpoint
app.delete('/api/admin/reviews/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM customer_reviews WHERE id = ?';
  
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ error: 'Failed to delete review' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  });
});

// Eligibility Calculator API Endpoints
// Submit eligibility calculation
app.post('/api/eligibility-submission', async (req, res) => {
  try {
    const { 
      name, phone, email, salary, existingEmi, age, employment, 
      rate, desiredYears, eligibleLoanAmount, affordableEmi, monthlySalary 
    } = req.body;
    
    if (!name || !phone || !email || !monthlySalary) {
      return res.status(400).json({ error: 'Name, phone, email, and salary are required' });
    }
    
    const [result] = await promisePool.query(
      `INSERT INTO eligibility_submissions 
       (name, phone, email, monthly_salary, existing_emi, age, employment_type, 
        interest_rate, desired_tenure_years, eligible_loan_amount, affordable_emi) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email, monthlySalary, existingEmi || 0, age, employment, 
       rate, desiredYears, eligibleLoanAmount, affordableEmi]
    );
    
    res.status(201).json({ 
      message: 'Eligibility submission received successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Eligibility submission error:', error);
    res.status(500).json({ error: 'Failed to submit eligibility calculation' });
  }
});

// Admin: Get all eligibility submissions
app.get('/api/admin/eligibility', authenticateToken, async (req, res) => {
  try {
    const [submissions] = await promisePool.query(
      'SELECT * FROM eligibility_submissions ORDER BY created_at DESC'
    );
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching eligibility submissions:', error);
    res.status(500).json({ error: 'Failed to fetch eligibility submissions' });
  }
});

// Admin: Update eligibility submission status
app.put('/api/admin/eligibility/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'reviewed', 'contacted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const [result] = await promisePool.query(
      'UPDATE eligibility_submissions SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.json({ message: `Eligibility submission ${status} successfully` });
  } catch (error) {
    console.error('Error updating eligibility status:', error);
    res.status(500).json({ error: 'Failed to update eligibility status' });
  }
});

// Admin: Update loan application status
app.put('/api/admin/loan-applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const [result] = await promisePool.query(
      'UPDATE loan_applications SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Loan application not found' });
    }
    
    res.json({ message: `Loan application ${status} successfully` });
  } catch (error) {
    console.error('Error updating loan application status:', error);
    res.status(500).json({ error: 'Failed to update loan application status' });
  }
});

// Testimonial Videos API Endpoints
// Get all active testimonial videos
app.get('/api/testimonial-videos', (req, res) => {
  const query = 'SELECT * FROM testimonial_videos WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC';
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching testimonial videos:', err);
      return res.status(500).json({ error: 'Failed to fetch testimonial videos' });
    }
    res.json(results);
  });
});

// Admin: Get all testimonial videos
app.get('/api/admin/testimonial-videos', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM testimonial_videos ORDER BY display_order ASC, created_at DESC';
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all testimonial videos:', err);
      return res.status(500).json({ error: 'Failed to fetch testimonial videos' });
    }
    res.json(results);
  });
});

// Admin: Add new testimonial video
app.post('/api/admin/testimonial-videos', authenticateToken, (req, res) => {
  const { title, video_url, customer_name, customer_location, description, display_order, image_url } = req.body;
  
  if (!title || !video_url) {
    return res.status(400).json({ error: 'Title and video URL are required' });
  }
  
  const query = `INSERT INTO testimonial_videos 
    (title, video_url, customer_name, customer_location, description, display_order, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  pool.query(query, [title, video_url, customer_name, customer_location, description, display_order || 0, image_url || null], (err, result) => {
    if (err) {
      console.error('Error adding testimonial video:', err);
      return res.status(500).json({ error: 'Failed to add testimonial video' });
    }
    res.status(201).json({ message: 'Testimonial video added successfully', id: result.insertId });
  });
});

// Admin: Update testimonial video
app.put('/api/admin/testimonial-videos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, video_url, customer_name, customer_location, description, display_order, is_active, image_url } = req.body;
  
  const query = `UPDATE testimonial_videos SET 
    title = ?, video_url = ?, customer_name = ?, customer_location = ?, 
    description = ?, display_order = ?, is_active = ?, image_url = ?, updated_at = NOW() 
    WHERE id = ?`;
  
  pool.query(query, [title, video_url, customer_name, customer_location, description, display_order, is_active, image_url || null, id], (err, result) => {
    if (err) {
      console.error('Error updating testimonial video:', err);
      return res.status(500).json({ error: 'Failed to update testimonial video' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Testimonial video not found' });
    }
    
    res.json({ message: 'Testimonial video updated successfully' });
  });
});

// Admin: Delete testimonial video
app.delete('/api/admin/testimonial-videos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM testimonial_videos WHERE id = ?';
  
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting testimonial video:', err);
      return res.status(500).json({ error: 'Failed to delete testimonial video' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Testimonial video not found' });
    }
    
    res.json({ message: 'Testimonial video deleted successfully' });
  });
});

// Events API endpoints

// Public: Get active events
app.get("/api/events", async (req, res) => {
  try {
    const query = `
      SELECT id, title, description, image_url, event_date, display_order,
             is_active, created_at, updated_at
      FROM events
      WHERE is_active = TRUE
      ORDER BY display_order ASC, created_at DESC
    `;

    const [results] = await pool.query(query);

    // Normalize image URLs (if stored as /api/images/:id)
    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const events = results.map(ev => ({
      ...ev,
      image_url: ev.image_url
        ? ev.image_url.startsWith("http")
          ? ev.image_url
          : `${base}${ev.image_url.startsWith("/") ? "" : "/"}${ev.image_url}`
        : null,
    }));

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});


// Admin: Get all events (including inactive)
app.get("/api/admin/events", authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, title, description, image_url, event_date, display_order,
             is_active, created_at, updated_at
      FROM events
      ORDER BY display_order ASC, created_at DESC
    `;

    const [results] = await pool.query(query);

    const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const events = results.map(ev => ({
      ...ev,
      image_url: ev.image_url
        ? ev.image_url.startsWith("http")
          ? ev.image_url
          : `${base}${ev.image_url.startsWith("/") ? "" : "/"}${ev.image_url}`
        : null,
    }));

    res.json(events);
  } catch (err) {
    console.error("Error fetching all events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Admin: Add new event
app.post(
  "/api/admin/events",
  authenticateToken,
  uploadMemory.single("image"),
  async (req, res) => {
    try {
      const { title, description, image_url, event_date, display_order, is_active } =
        req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      // Prefer uploaded file → store in DB; else use provided image_url (optional)
      let finalImageUrl = image_url || null;
      if (req.file) {
        const { imageUrl } = await saveImageAndGetUrl(req.file, req);
        finalImageUrl = imageUrl;
      }
      if (!finalImageUrl) {
        // If you want to require an image, uncomment next line:
        // return res.status(400).json({ error: "Image is required" });
      }

      const query = `INSERT INTO events
        (title, description, image_url, event_date, display_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?)`;

      const params = [
        title,
        description || null,
        finalImageUrl,
        event_date || null,
        Number(display_order) || 0,
        (is_active === "true" || is_active === true) ? 1 : 0,
      ];

      const [result] = await pool.query(query, params);
      res
        .status(201)
        .json({ message: "Event added successfully", id: result.insertId, image_url: finalImageUrl });
    } catch (err) {
      console.error("Error adding event:", err);
      res.status(500).json({ error: "Failed to add event" });
    }
  }
);

// ====== Admin: Update event (JSON OR multipart with 'image') ======
app.put(
  "/api/admin/events/:id",
  authenticateToken,
  uploadMemory.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        image_url, // optional fallback
        event_date,
        display_order,
        is_active,
      } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      let finalImageUrl = image_url || null;
      if (req.file) {
        const { imageUrl } = await saveImageAndGetUrl(req.file, req);
        finalImageUrl = imageUrl;
      }

      const query = `UPDATE events SET
        title = ?, description = ?, image_url = ?, event_date = ?,
        display_order = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?`;

      const params = [
        title,
        description || null,
        finalImageUrl,
        event_date || null,
        Number(display_order) || 0,
        (is_active === "true" || is_active === true) ? 1 : 0,
        id,
      ];

      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ message: "Event updated successfully", image_url: finalImageUrl });
    } catch (err) {
      console.error("Error updating event:", err);
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

// ====== (Optional) Keep a dedicated upload route if your UI uses it ======
app.put(
  "/api/admin/events/:id/upload",
  authenticateToken,
  uploadMemory.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, image_url, event_date, display_order, is_active } =
        req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      let finalImageUrl = image_url || null;
      if (req.file) {
        const { imageUrl } = await saveImageAndGetUrl(req.file, req);
        finalImageUrl = imageUrl;
      }

      const query = `UPDATE events SET
        title = ?, description = ?, image_url = ?, event_date = ?,
        display_order = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?`;

      const params = [
        title,
        description || null,
        finalImageUrl,
        event_date || null,
        Number(display_order) || 0,
        (is_active === "true" || is_active === true) ? 1 : 0,
        id,
      ];

      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ message: "Event updated successfully", image_url: finalImageUrl });
    } catch (error) {
      console.error("Error uploading event image:", error);
      res.status(500).json({ error: "Failed to upload event image" });
    }
  }
);

// ====== Admin: Delete event (unchanged) ======
app.delete("/api/admin/events/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM events WHERE id = ?";

  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ error: "Failed to delete event" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  });
});

// Regulatory Updates API Endpoints

// Public: Get active regulatory updates
app.get('/api/regulatory-updates', (req, res) => {
  const query = 'SELECT * FROM regulatory_updates WHERE is_active = TRUE ORDER BY category, display_order ASC, created_at DESC';
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching regulatory updates:', err);
      return res.status(500).json({ error: 'Failed to fetch regulatory updates' });
    }
    res.json(results);
  });
});

// Admin: Get all regulatory updates
app.get('/api/admin/regulatory-updates', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM regulatory_updates ORDER BY category, display_order ASC, created_at DESC';
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all regulatory updates:', err);
      return res.status(500).json({ error: 'Failed to fetch regulatory updates' });
    }
    res.json(results);
  });
});

// Admin: Add new regulatory update
app.post('/api/admin/regulatory-updates', authenticateToken, (req, res) => {
  const { title, content, category, display_order } = req.body;
  
  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required' });
  }
  
  if (!['RBI', 'GST'].includes(category)) {
    return res.status(400).json({ error: 'Category must be either RBI or GST' });
  }
  
  const query = `INSERT INTO regulatory_updates 
    (title, content, category, display_order) 
    VALUES (?, ?, ?, ?)`;
  
  pool.query(query, [title, content, category, display_order || 0], (err, result) => {
    if (err) {
      console.error('Error adding regulatory update:', err);
      return res.status(500).json({ error: 'Failed to add regulatory update' });
    }
    res.status(201).json({ message: 'Regulatory update added successfully', id: result.insertId });
  });
});

// Admin: Update regulatory update
app.put('/api/admin/regulatory-updates/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, category, display_order, is_active } = req.body;
  
  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required' });
  }
  
  if (!['RBI', 'GST'].includes(category)) {
    return res.status(400).json({ error: 'Category must be either RBI or GST' });
  }
  
  const query = `UPDATE regulatory_updates SET 
    title = ?, content = ?, category = ?, display_order = ?, is_active = ?, updated_at = NOW() 
    WHERE id = ?`;
  
  pool.query(query, [title, content, category, display_order, is_active, id], (err, result) => {
    if (err) {
      console.error('Error updating regulatory update:', err);
      return res.status(500).json({ error: 'Failed to update regulatory update' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Regulatory update not found' });
    }
    
    res.json({ message: 'Regulatory update updated successfully' });
  });
});

// Admin: Delete regulatory update
app.delete('/api/admin/regulatory-updates/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM regulatory_updates WHERE id = ?';
  
  pool.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting regulatory update:', err);
      return res.status(500).json({ error: 'Failed to delete regulatory update' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Regulatory update not found' });
    }
    
    res.json({ message: 'Regulatory update deleted successfully' });
  });
});

// File Upload Endpoints

// Admin: Add new event with file upload
app.post('/api/admin/events/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, event_date, display_order, is_active } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Construct the image URL
    const image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const query = `INSERT INTO events 
      (title, description, image_url, event_date, display_order, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    
    pool.query(query, [title, description, image_url, event_date, display_order || 0, is_active === 'true' || is_active === true], (err, result) => {
      if (err) {
        console.error('Error adding event:', err);
        return res.status(500).json({ error: 'Failed to add event' });
      }
      res.status(201).json({ 
        message: 'Event added successfully', 
        id: result.insertId,
        image_url: image_url
      });
    });
  } catch (error) {
    console.error('Error uploading event image:', error);
    res.status(500).json({ error: 'Failed to upload event image' });
  }
});

// Admin: Add new testimonial video with file upload
app.post('/api/admin/testimonial-videos/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, video_url, customer_name, customer_location, description, display_order, is_active } = req.body;
    
    if (!title || !video_url) {
      return res.status(400).json({ error: 'Title and video URL are required' });
    }
    
    // Construct the image URL
    const image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const query = `INSERT INTO testimonial_videos 
      (title, video_url, customer_name, customer_location, description, display_order, is_active, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    pool.query(query, [title, video_url, customer_name, customer_location, description, display_order || 0, is_active === 'true' || is_active === true, image_url], (err, result) => {
      if (err) {
        console.error('Error adding testimonial video:', err);
        return res.status(500).json({ error: 'Failed to add testimonial video' });
      }
      res.status(201).json({ 
        message: 'Testimonial video added successfully', 
        id: result.insertId,
        image_url: image_url
      });
    });
  } catch (error) {
    console.error('Error uploading testimonial image:', error);
    res.status(500).json({ error: 'Failed to upload testimonial image' });
  }
});

// Admin: Update testimonial video with file upload
app.put('/api/admin/testimonial-videos/:id/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, video_url, customer_name, customer_location, description, display_order, is_active } = req.body;
    
    if (!title || !video_url) {
      return res.status(400).json({ error: 'Title and video URL are required' });
    }
    
    let imageUrl = req.body.image_url || null;
    
    // If a new file was uploaded, use that
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    
    const query = `UPDATE testimonial_videos SET 
      title = ?, video_url = ?, customer_name = ?, customer_location = ?, 
      description = ?, display_order = ?, is_active = ?, image_url = ?, updated_at = NOW() 
      WHERE id = ?`;
    
    pool.query(query, [title, video_url, customer_name, customer_location, description, display_order, is_active, imageUrl, id], (err, result) => {
      if (err) {
        console.error('Error updating testimonial video:', err);
        return res.status(500).json({ error: 'Failed to update testimonial video' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Testimonial video not found' });
      }
      
      res.json({ 
        message: 'Testimonial video updated successfully',
        image_url: imageUrl
      });
    });
  } catch (error) {
    console.error('Error uploading testimonial image:', error);
    res.status(500).json({ error: 'Failed to upload testimonial image' });
  }
});

// Admin: Update referral status
app.put('/api/admin/referrals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, accepted, or rejected.' });
    }
    
    const [result] = await promisePool.query(
      'UPDATE referrals SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Referral not found' });
    }
    
    res.json({ message: `Referral ${status} successfully` });
  } catch (error) {
    console.error('Error updating referral status:', error);
    res.status(500).json({ error: 'Failed to update referral status' });
  }
});

// Admin: Delete referral
app.delete('/api/admin/referrals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await promisePool.query(
      'DELETE FROM referrals WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Referral not found' });
    }
    
    res.json({ message: 'Referral deleted successfully' });
  } catch (error) {
    console.error('Error deleting referral:', error);
    res.status(500).json({ error: 'Failed to delete referral' });
  }
});

// Admin: Delete loan application
app.delete('/api/admin/loan-applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await promisePool.query(
      'DELETE FROM loan_applications WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Loan application not found' });
    }
    
    res.json({ message: 'Loan application deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan application:', error);
    res.status(500).json({ error: 'Failed to delete loan application' });
  }
});

// Admin: Delete eligibility submission
app.delete('/api/admin/eligibility/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await promisePool.query(
      'DELETE FROM eligibility_submissions WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Eligibility submission not found' });
    }
    
    res.json({ message: 'Eligibility submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting eligibility submission:', error);
    res.status(500).json({ error: 'Failed to delete eligibility submission' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
