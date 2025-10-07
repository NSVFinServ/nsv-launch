-- NSV App Database Schema - Complete Version

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS nsv;
USE nsv;

-- 2. Users Table (for login/sign up)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Referral Table (Updated with referred person details)
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referred_name VARCHAR(100) NOT NULL,
    referred_email VARCHAR(100) NOT NULL,
    referred_phone VARCHAR(20),
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id)
);

-- 4. Services Table (for types of loan/services)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 5. Ask the Expert Table (Q&A or expert advice feature)
CREATE TABLE IF NOT EXISTS ask_expert (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Loan Applications Table (linked to users, services, and optionally ask_expert)
CREATE TABLE IF NOT EXISTS loan_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    ask_expert_id INT,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (ask_expert_id) REFERENCES ask_expert(id)
);

-- 7. Website Analytics Table (for tracking user interactions)
CREATE TABLE IF NOT EXISTS website_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    user_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Password Reset Table (for forgot password functionality)
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

-- 9. Insert Sample Services
INSERT INTO services (name, description) VALUES
('Home Loan', 'Loan for purchasing a house'),
('Personal Loan', 'Unsecured personal loan'),
('Vehicle Loan', 'Loan for buying a vehicle'),
('Education Loan', 'Loan for education expenses'),
('Gold Loan', 'Loan against gold'),
('Mortgage Loan', 'Loan against property');

-- 10. Create Indexes for Better Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_service_id ON loan_applications(service_id);
CREATE INDEX idx_website_analytics_user_id ON website_analytics(user_id);
CREATE INDEX idx_website_analytics_timestamp ON website_analytics(timestamp);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_email ON password_resets(email);

-- 12. Customer Reviews Table (for customer testimonials)
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
);

-- 13. Eligibility Submissions Table (for loan eligibility calculator)
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
);

-- 14. Testimonial Videos Table (for customer video testimonials)
CREATE TABLE IF NOT EXISTS testimonial_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    video_url TEXT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_location VARCHAR(100),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 15. Events Table (for promotional events)
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
);

-- 16. Create Indexes for New Tables
CREATE INDEX idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX idx_eligibility_submissions_status ON eligibility_submissions(status);
CREATE INDEX idx_testimonial_videos_active ON testimonial_videos(is_active);
CREATE INDEX idx_testimonial_videos_order ON testimonial_videos(display_order);
CREATE INDEX idx_events_active ON events(is_active);
CREATE INDEX idx_events_order ON events(display_order);

-- 16. Regulatory Updates Table (for RBI and GST updates)
CREATE TABLE IF NOT EXISTS regulatory_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('RBI', 'GST') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 17. Create Indexes for Regulatory Updates Table
CREATE INDEX idx_regulatory_updates_active ON regulatory_updates(is_active);
CREATE INDEX idx_regulatory_updates_category ON regulatory_updates(category);
CREATE INDEX idx_regulatory_updates_order ON regulatory_updates(display_order);

-- 18. Show Table Structures
SHOW TABLES;
DESCRIBE users;
DESCRIBE referrals;
DESCRIBE services;
DESCRIBE ask_expert;
DESCRIBE loan_applications;
DESCRIBE website_analytics;
DESCRIBE password_resets;
DESCRIBE customer_reviews;
DESCRIBE eligibility_submissions;
DESCRIBE testimonial_videos;
DESCRIBE events;
DESCRIBE regulatory_updates;

-- Add image_url column to testimonial_videos table if it doesn't exist
ALTER TABLE testimonial_videos ADD COLUMN IF NOT EXISTS image_url TEXT;
