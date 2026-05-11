-- =============================================
--   auth_update.sql
--   Run this in phpMyAdmin to update the users
--   table with the new columns needed for auth.
--
--   If you already ran studyplanner_setup.sql,
--   just run THIS file to add the new columns.
--   It is safe to run multiple times (IF NOT EXISTS).
-- =============================================

USE studyplanner;

-- Add visit_count column if it doesn't exist
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS visit_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_login  DATETIME NULL;

-- Remove the old sample user (it has a bcrypt hash that won't work
-- with our new password_verify flow because the sample hash above
-- was for "password123" — you can re-create your own account via
-- the signup form instead).
-- OPTIONAL: uncomment the line below to wipe demo users and start fresh
-- DELETE FROM users;

-- If you want a fresh start with no demo users, run:
-- TRUNCATE TABLE users;
