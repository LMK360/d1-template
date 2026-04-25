-- Migration number: 0001  (updated for auth system)

-- 🧨 Drop old demo table (optional but clean)
DROP TABLE IF EXISTS comments;

-- 🔐 Create users table for login system
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- (Optional) keep comments system if you still want it later
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    content TEXT NOT NULL
);
