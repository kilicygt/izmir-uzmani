import Database from 'better-sqlite3';
import path from 'path';

// Helper to get DB path. 
// In dev, it's relative to cwd.
// In prod, it depends on where we run. 
// For now, we put it in the project root.
const dbPath = path.resolve('cms.db');

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    category TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add SEO columns if they don't exist in existing DB
try { db.exec("ALTER TABLE posts ADD COLUMN seo_title TEXT"); } catch (e) { }
try { db.exec("ALTER TABLE posts ADD COLUMN seo_description TEXT"); } catch (e) { }

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

// Seed Admin if not exists
const adminCheck = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminCheck) {
  // Default password: admin
  // In a real app, hash this!
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'admin');
}

// Seed Posts if empty
const postsCount = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number }).count;
if (postsCount === 0) {
  const insertPost = db.prepare('INSERT INTO posts (title, slug, excerpt, content, category) VALUES (?, ?, ?, ?, ?)');

  const samplePosts = [
    {
      title: "İzmir'in En İyi Boyozcuları",
      slug: "izmirin-en-iyi-boyozculari",
      excerpt: "Sabah kahvaltılarının vazgeçilmezi boyozun en iyi adresleri.",
      content: "İçerik buraya gelecek...",
      category: "Yeme-İçme"
    },
    {
      title: "Kemeraltı Lezzet Durakları",
      slug: "kemeralti-lezzet-duraklari",
      excerpt: "Tarihi çarşıda kaybolurken tatmanız gereken lezzetler.",
      content: "İçerik buraya gelecek...",
      category: "Yeme-İçme"
    },
    {
      title: "Efes Antik Tiyatro Konserleri",
      slug: "efes-antik-tiyatro-konserleri",
      excerpt: "Tarihi atmosferde müzik şöleni. Bu yazın etkinlik takvimi.",
      content: "İçerik buraya gelecek...",
      category: "Etkinlikler"
    },
    {
      title: "İzmir Kitap Fuarı Takvimi",
      slug: "izmir-kitap-fuari-takvimi",
      excerpt: "Kitapseverlerin buluşma noktası fuar hakkında detaylar.",
      content: "İçerik buraya gelecek...",
      category: "Etkinlikler"
    },
    {
      title: "Kordon Boyu Yürüyüş Rehberi",
      slug: "kordon-boyu-yuruyus-rehberi",
      excerpt: "Gün batımının en güzel izlendiği yer: Kordon.",
      content: "İçerik buraya gelecek...",
      category: "Gezi"
    },
    {
      title: "Urla Bağ Yolu Rotası",
      slug: "urla-bag-yolu-rotasi",
      excerpt: "Doğa ile iç içe, gastronomi ve tadım rotası.",
      content: "İçerik buraya gelecek...",
      category: "Gezi"
    }
  ];

  samplePosts.forEach(post => {
    insertPost.run(post.title, post.slug, post.excerpt, post.content, post.category);
  });
}

export default db;
