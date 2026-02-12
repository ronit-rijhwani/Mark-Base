-- Migration script to add new fields to existing database
-- Run this if you have existing data

-- Add class_id and division_id to staff table
ALTER TABLE staff ADD COLUMN class_id INTEGER;
ALTER TABLE staff ADD COLUMN division_id INTEGER;

-- Add enrollment_number to students table
ALTER TABLE students ADD COLUMN enrollment_number VARCHAR(50);

-- Note: SQLite doesn't support adding foreign key constraints to existing tables
-- If you need foreign keys, you'll need to recreate the table
