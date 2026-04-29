-- =============================================
--   db_migration_v2.sql
--   Run this in phpMyAdmin (studyplanner DB)
--   to apply all multi-user fixes.
-- =============================================

USE studyplanner;

-- 1. Make email nullable (signup form doesn't collect email)
ALTER TABLE users MODIFY COLUMN email VARCHAR(150) NULL DEFAULT NULL;

-- 2. Add user_id to tasks (allows per-user tasks)
ALTER TABLE tasks ADD COLUMN user_id INT NULL DEFAULT NULL;

-- 3. Remove the old shared sample tasks so each user starts clean
DELETE FROM tasks;

-- 4. Create subjects table (per-user)
CREATE TABLE IF NOT EXISTS subjects (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    name       VARCHAR(100) NOT NULL,
    color      VARCHAR(7)   DEFAULT '#4f7cac',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
