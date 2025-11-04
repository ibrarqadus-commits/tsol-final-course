-- MySQL schema for Courseinfinity users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','student') NOT NULL DEFAULT 'student',
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed an admin user (change email/password after import)
INSERT IGNORE INTO users (name, email, password_hash, role, approved)
VALUES ('Admin', 'admin@lm.com', '$2y$10$wG2yOq2u0o1b3A3yGg7sveQnJQKx4qgOiiE5jv8y0l1s5T0WZ3r2y', 'admin', 1);
-- The above hash corresponds to password: admin123

-- Units content and video links
CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id VARCHAR(10) NOT NULL,
  unit_id VARCHAR(10) NOT NULL,
  content MEDIUMTEXT NULL,
  video_url TEXT NULL,
  UNIQUE KEY uniq_unit (module_id, unit_id)
);

-- Home page video and content settings (single row with id=1)
CREATE TABLE IF NOT EXISTS video_settings (
  id TINYINT PRIMARY KEY,
  hero_video TEXT NULL,
  video2 TEXT NULL,
  home_content MEDIUMTEXT NULL
);
INSERT IGNORE INTO video_settings (id) VALUES (1);


