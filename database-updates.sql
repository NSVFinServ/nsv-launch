-- Database Updates for New Features
-- Run this after the main schema.sql

USE nsv;

-- 1. Eligibility Calculator Table
CREATE TABLE IF NOT EXISTS eligibility_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    monthly_salary DECIMAL(12,2) NOT NULL,
    existing_emi DECIMAL(12,2) DEFAULT 0,
    age INT NOT NULL,
    employment_type ENUM('salaried', 'self') NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    desired_tenure_years INT NOT NULL,
    eligible_loan_amount DECIMAL(15,2) NOT NULL,
    affordable_emi DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'reviewed', 'contacted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Testimonial Videos Table
CREATE TABLE IF NOT EXISTS testimonial_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    customer_name VARCHAR(100),
    customer_location VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Update customer_reviews table to ensure proper status handling
-- (The table already exists, but let's ensure it has the right structure)
ALTER TABLE customer_reviews 
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing reviews to have 'verified' status if they're approved
UPDATE customer_reviews 
SET status = 'verified' 
WHERE is_approved = TRUE AND status IS NULL;

UPDATE customer_reviews 
SET status = 'pending' 
WHERE is_approved = FALSE AND status IS NULL;

-- 4. Create indexes for better performance
CREATE INDEX idx_eligibility_submissions_status ON eligibility_submissions(status);
CREATE INDEX idx_eligibility_submissions_created_at ON eligibility_submissions(created_at);
CREATE INDEX idx_testimonial_videos_is_active ON testimonial_videos(is_active);
CREATE INDEX idx_testimonial_videos_display_order ON testimonial_videos(display_order);
CREATE INDEX idx_customer_reviews_status ON customer_reviews(status);

-- 5. Insert sample testimonial videos
INSERT INTO testimonial_videos (title, video_url, customer_name, customer_location, description, display_order) VALUES
('Home Loan Success Story', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Rajesh Kumar', 'Mumbai, Maharashtra', 'How NSV Finserv helped me get my dream home loan at the best rate', 1),
('Business Loan Testimonial', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Priya Sharma', 'Delhi, NCR', 'Quick business loan approval helped expand my startup', 2),
('Personal Loan Experience', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Arun Patel', 'Bangalore, Karnataka', 'Hassle-free personal loan process with transparent terms', 3);

-- Show table structures
DESCRIBE eligibility_submissions;
DESCRIBE testimonial_videos;
DESCRIBE customer_reviews;