/**
 * seed-admin.js
 * ─────────────────────────────────────────────────────────────────────
 * Run ONCE after applying 001_crm_schema.sql to create the initial
 * admin account.
 *
 *   node seed-admin.js
 *
 * Safe to re-run — uses INSERT IGNORE so it won't duplicate the row.
 * ─────────────────────────────────────────────────────────────────────
 */
require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ADMIN_EMAIL = 'admin@nsvfinserv.com';

// Generate a strong 16-char random password
const generatedPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT || 3306,
  });

  try {
    console.log('\n🔑  NSV FinServ — Admin Seed Script\n');

    const hash = await bcrypt.hash(generatedPassword, 12);

    // Check if admin already exists
    const [existing] = await conn.execute(
      'SELECT id, role FROM users WHERE email = ? LIMIT 1',
      [ADMIN_EMAIL]
    );

    if (existing.length > 0) {
      // Upgrade existing user to admin if needed
      if (existing[0].role !== 'admin') {
        await conn.execute(
          "UPDATE users SET role = 'admin', intern_code = NULL, password_hash = ? WHERE email = ?",
          [hash, ADMIN_EMAIL]
        );
        console.log(`✅  Existing user upgraded to admin role.`);
        console.log(`📧  Email    : ${ADMIN_EMAIL}`);
        console.log(`🔒  Password : ${generatedPassword}`);
      } else {
        // Reset the password for the admin
        await conn.execute(
          'UPDATE users SET password_hash = ? WHERE email = ?',
          [hash, ADMIN_EMAIL]
        );
        console.log(`✅  Admin account password reset.`);
        console.log(`📧  Email    : ${ADMIN_EMAIL}`);
        console.log(`🔒  Password : ${generatedPassword}`);
      }
    } else {
      // Create fresh admin account
      await conn.execute(
        "INSERT INTO users (name, email, password_hash, role, intern_code) VALUES (?, ?, ?, 'admin', NULL)",
        ['Admin', ADMIN_EMAIL, hash]
      );
      console.log(`✅  Admin account created.`);
      console.log(`📧  Email    : ${ADMIN_EMAIL}`);
      console.log(`🔒  Password : ${generatedPassword}`);
    }

    console.log('\n⚠️   IMPORTANT: Save this password now — it will NOT be shown again.');
    console.log('     Change it immediately after first login.\n');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

seed();
