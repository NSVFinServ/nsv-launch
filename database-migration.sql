-- Database Migration Script
-- Run this in MySQL Workbench to update the referrals table

USE nsv;

-- Add new columns to referrals table
ALTER TABLE referrals 
ADD COLUMN referred_name VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN referred_phone VARCHAR(20) DEFAULT NULL;

-- Update existing records (if any) with placeholder data
UPDATE referrals 
SET referred_name = 'Unknown', referred_phone = 'N/A' 
WHERE referred_name = '';

-- Make referred_name NOT NULL after updating existing records
ALTER TABLE referrals 
MODIFY COLUMN referred_name VARCHAR(100) NOT NULL;

-- Show the updated table structure
DESCRIBE referrals;

-- Create customer reviews table with admin approval
CREATE TABLE IF NOT EXISTS customer_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    loan_type VARCHAR(100),
    loan_amount VARCHAR(50),
    review_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for better performance
CREATE INDEX idx_customer_reviews_is_approved ON customer_reviews(is_approved);
CREATE INDEX idx_customer_reviews_user_id ON customer_reviews(user_id);

-- Insert sample approved reviews for testing
INSERT INTO customer_reviews (name, location, rating, loan_type, loan_amount, review_text, is_approved, approved_at) VALUES
('Rajesh Sharma', 'Mumbai, Maharashtra', 5, 'Home Loan', '₹45 Lakhs', 'NSV Finserv helped me get the best home loan rate at 6.8%. The process was completely transparent and they guided me through every step. Highly recommended!', TRUE, NOW()),
('Priya Patel', 'Ahmedabad, Gujarat', 5, 'Business Loan', '₹25 Lakhs', 'Got my business loan approved in just 3 days! The team was very professional and the interest rate was much better than what my bank offered.', TRUE, NOW()),
('Arun Kumar', 'Bangalore, Karnataka', 5, 'Car Loan', '₹8 Lakhs', 'Excellent service! They found me a car loan with 90% funding at competitive rates. The documentation process was hassle-free.', TRUE, NOW());
