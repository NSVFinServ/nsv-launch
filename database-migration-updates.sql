-- Database Migration Updates for NSV App
-- Run this to add missing columns and fix existing issues

USE nsv;

-- Add updated_at column to referrals table
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add updated_at column to loan_applications table if it doesn't exist
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Ensure all tables have proper indexes
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);

-- Show updated table structures
DESCRIBE referrals;
DESCRIBE loan_applications;
DESCRIBE eligibility_submissions;

-- Verify all tables exist
SHOW TABLES;
