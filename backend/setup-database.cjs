const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST, // e.g. 'localhost'
  user: process.env.DB_USER, // e.g. 'root'
  password: process.env.DB_PASSWORD, // e.g. 'password'
  database: process.env.DB_NAME, // e.g. 'nsv'
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

async function setupDatabase() {
  try {
    console.log('🔄 Checking MySQL database connection...\n');
    
    // Test connection first
    const [connectionTest] = await db.promise().query('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    
    // Check if database exists
    const [databases] = await db.promise().query('SHOW DATABASES LIKE "nsv"');
    if (databases.length > 0) {
      console.log('✅ Database "nsv" exists!');
    } else {
      console.log('❌ Database "nsv" does not exist!');
      return;
    }
    
    // Check tables
    const [tables] = await db.promise().query('SHOW TABLES');
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      console.log(`   ✅ ${Object.values(table)[0]}`);
    });
    
    // Check users table structure
    console.log('\n👤 Users table structure:');
    const [userCols] = await db.promise().query('DESCRIBE users');
    userCols.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // Test a simple query
    const [userCount] = await db.promise().query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total users in database: ${userCount[0].count}`);
    
    console.log('\n🎉 Database is ready and fully functional!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    db.end();
  }
}

setupDatabase();