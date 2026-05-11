-- =============================================
--   studyplanner_setup.sql
--   Run this in phpMyAdmin to create your database
-- =============================================

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS studyplanner
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE studyplanner;


-- =============================================
--   TABLE: tasks
--   Stores tasks AND exams (type = 'task' or 'exam')
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    title     VARCHAR(255)  NOT NULL,
    due_date  DATE          NULL,
    type      ENUM('task','exam') DEFAULT 'task',
    done      TINYINT(1)    DEFAULT 0,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Sample tasks
INSERT INTO tasks (title, due_date, type, done) VALUES
    ('Read Chapter 5 - Biology',     '2026-04-14', 'task', 0),
    ('Complete Algebra Worksheet',   '2026-04-14', 'task', 0),
    ('Research WWII Events',         '2026-04-15', 'task', 0),
    ('Write English Essay Draft',    '2026-04-16', 'task', 0),
    ('Math Exam',                    '2026-05-28', 'exam', 0);


-- =============================================
--   TABLE: schedule
--   Today's study sessions shown on dashboard
-- =============================================
CREATE TABLE IF NOT EXISTS schedule (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    session_date DATE         NOT NULL,
    time         TIME         NOT NULL,
    title        VARCHAR(255) NOT NULL,
    subtitle     VARCHAR(255) NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Sample schedule for today (change date to today's date!)
INSERT INTO schedule (session_date, time, title, subtitle) VALUES
    (CURDATE(), '10:00:00', 'Biology Revision', 'Chapter 5 Review'),
    (CURDATE(), '11:30:00', 'Math Practice',    'Algebra Exercises'),
    (CURDATE(), '13:00:00', 'History Notes',    'WWII Summary'),
    (CURDATE(), '14:30:00', 'English Essay',    'Outline & Draft');


-- =============================================
--   TABLE: users  (for future login feature)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Sample user (password = "password123" hashed)
INSERT INTO users (name, email, password) VALUES
    ('Alex', 'alex@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
