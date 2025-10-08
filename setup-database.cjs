const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Database connection without specifying database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  port: 3306,
  multipleStatements: true
});

async function setupDatabase() {
  try {
    console.log('🔄 Setting up MySQL database...\n');
    
    // First create the database
    await db.promise().query('CREATE DATABASE IF NOT EXISTS nsv');
    console.log('✅ Database "nsv" created successfully!\n');
    
    // Now connect to the database
    db.config.database = 'nsv';
    db.connect();
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await db.promise().query(schema);
    
    console.log('✅ Database schema setup completed successfully!\n');
    
    // Check tables
    const [tables] = await db.promise().query('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // Check users table structure
    console.log('\n👤 Users table structure:');
    const [userCols] = await db.promise().query('DESCRIBE users');
    userCols.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    console.log('\n🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    // Let's try to create the missing tables individually
    try {
      console.log('\n🔄 Trying to create missing tables individually...\n');
      
      // Create customer_reviews table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS customer_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100),
          phone VARCHAR(20),
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review_text TEXT NOT NULL,
          status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      console.log('✅ customer_reviews table created');
      
      // Create eligibility_submissions table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS eligibility_submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(100) NOT NULL,
          monthly_salary DECIMAL(15,2) NOT NULL,
          existing_emi DECIMAL(15,2) DEFAULT 0,
          age INT NOT NULL,
          employment_type VARCHAR(50) NOT NULL,
          interest_rate DECIMAL(5,2) NOT NULL,
          desired_tenure_years INT NOT NULL,
          eligible_loan_amount DECIMAL(15,2) NOT NULL,
          affordable_emi DECIMAL(15,2) NOT NULL,
          status ENUM('pending', 'reviewed', 'contacted') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ eligibility_submissions table created');
      
      // Create testimonial_videos table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS testimonial_videos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          video_url TEXT NOT NULL,
          customer_name VARCHAR(100) NOT NULL,
          customer_location VARCHAR(100),
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ testimonial_videos table created');
      
      // Create events table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          event_date DATE,
          is_active BOOLEAN DEFAULT TRUE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ events table created');
      
      // Create regulatory_updates table
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS regulatory_updates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          category ENUM('RBI', 'GST') NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ regulatory_updates table created');
      
      console.log('\n🎉 All missing tables created successfully!');
      
    } catch (innerError) {
      console.error('❌ Failed to create missing tables:', innerError.message);
    }
  } finally {
    db.end();
  }
}

setupDatabase();