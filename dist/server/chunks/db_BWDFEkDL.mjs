import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve("cms.db");
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);
const adminCheck = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminCheck) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", "admin");
}

export { db as d };
