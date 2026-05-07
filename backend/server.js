require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

const instanceId = `${os.hostname()}-${process.pid}`;

let requestCount = 0;

/* ================= CORE MIDDLEWARE ================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  requestCount++;
  console.log(`[${instanceId}] ${req.method} ${req.url}`);

  res.setHeader('X-Instance-Id', instanceId);
  res.setHeader('X-Request-Count', requestCount);

  next();
});

/* ================= POSTGRES ================= */

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'family_shop',
});

/* ================= DB INIT ================= */

redisClient.connect().catch(console.error);

redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('error', (err) => console.error('Redis error:', err));

// Настройка CORS для работы с credentials
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

async function start() {
  await redisClient.connect();

  app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86400000
    }
  }));

  initDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('Backend started');
    });
  });
}

start();

// PostgreSQL подключение (без изменений)
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'family_shop',
});

// Инициализация БД (ваш существующий код)
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        old_price INTEGER,
        image TEXT,
        rating INTEGER DEFAULT 4,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar VARCHAR(10),
        items_count INTEGER DEFAULT 0
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        member_id INTEGER REFERENCES family_members(id),
        quantity INTEGER DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        family_member_id INTEGER REFERENCES family_members(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* ===== SEED PRODUCTS ===== */

    const productsCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (name, price, old_price, image, rating) VALUES
        ('Смартфон Xiaomi Redmi Note 12', 24990, 29990, 'https://via.placeholder.com/300x200', 4),
        ('Наушники Sony WH-1000XM4', 27990, NULL, 'https://via.placeholder.com/300x200', 5),
        ('Робот-пылесос Xiaomi Vacuum', 18990, 22990, 'https://via.placeholder.com/300x200', 4),
        ('Планшет Samsung Tab S8', 45990, 49990, 'https://via.placeholder.com/300x200', 5),
        ('Умная колонка Яндекс Станция', 12990, 14990, 'https://via.placeholder.com/300x200', 4),
        ('Фитнес-браслет Xiaomi Mi Band 8', 3990, 4990, 'https://via.placeholder.com/300x200', 4)
      `);
    }

    /* ===== SEED FAMILY ===== */

    const membersCount = await client.query('SELECT COUNT(*) FROM family_members');
    if (parseInt(membersCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO family_members (name, avatar, items_count) VALUES
        ('Анна', '👩', 2),
        ('Алексей', '👨', 1),
        ('Миша', '👦', 3),
        ('Катя', '👧', 0)
      `);
    }

    /* ===== SEED USERS ===== */

    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (username, password_hash, family_member_id) VALUES
        ('anna', 'test123', 1),
        ('alexey', 'test123', 2)
      `);
    }

    console.log('Database initialized');
  } finally {
    client.release();
  }
}

/* ================= REDIS + SESSION ================= */

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

/* ================= START APP ================= */

async function start() {
  try {
    /* 1. Redis FIRST */
    await redisClient.connect();
    console.log('Redis connected');

    /* 2. SESSION SECOND */
    app.use(session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'dev-secret',
      resave: false,
      saveUninitialized: false,
      name: 'sessionId',
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
      }
    }));

    /* 3. AUTH ROUTES */
    app.post('/api/login', async (req, res) => {
      const { username, password } = req.body;

      try {
        const result = await pool.query(
          'SELECT * FROM users WHERE username = $1 AND password_hash = $2',
          [username, password]
        );

        if (!result.rows.length) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.familyMemberId = user.family_member_id;

        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username
          }
        });

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/me', (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ authenticated: false });
      }

      res.json({
        authenticated: true,
        user: {
          id: req.session.userId,
          username: req.session.username,
          family_member_id: req.session.familyMemberId
        }
      });
    });

    app.post('/api/logout', (req, res) => {
      req.session.destroy(() => {
        res.json({ success: true });
      });
    });

    /* 4. OTHER API */

    app.get('/api/products', async (req, res) => {
      const result = await pool.query('SELECT * FROM products ORDER BY id');
      res.json(result.rows);
    });

    app.get('/api/family-members', async (req, res) => {
      const result = await pool.query('SELECT * FROM family_members ORDER BY id');
      res.json(result.rows);
    });

    app.post('/api/cart/add', async (req, res) => {
      const { product_id, member_id } = req.body;

      await pool.query(
        'INSERT INTO cart_items (product_id, member_id) VALUES ($1, $2)',
        [product_id, member_id]
      );

      await pool.query(
        'UPDATE family_members SET items_count = items_count + 1 WHERE id = $1',
        [member_id]
      );

      res.json({ success: true });
    });

    app.get('/api/cart/total', async (req, res) => {
      const result = await pool.query('SELECT COUNT(*) as total FROM cart_items');
      res.json({ total: parseInt(result.rows[0].total) });
    });

    /* 5. INIT DB */
    await initDB();

    /* 6. START SERVER */
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running on port ${PORT}`);
      console.log(`Instance: ${instanceId}`);
    });

  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
  
  try {
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE product_id = $1 AND member_id = $2',
      [product_id, member_id]
    );
    
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + 1 WHERE product_id = $1 AND member_id = $2',
        [product_id, member_id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (product_id, member_id) VALUES ($1, $2)',
        [product_id, member_id]
      );
    }
    
    await pool.query(
      'UPDATE family_members SET items_count = items_count + 1 WHERE id = $1',
      [member_id]
    );
    
    res.json({ success: true, servedBy: os.hostname() });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cart/total', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM cart_items');
    res.json({ total: parseInt(result.rows[0].total) });
  } catch (error) {
    console.error('Error getting cart total:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/state/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    await pool.query(
      `INSERT INTO app_state (key, value, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(value)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/state/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const result = await pool.query('SELECT value FROM app_state WHERE key = $1', [key]);
    if (result.rows[0]) {
      res.json(JSON.parse(result.rows[0].value));
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Hostname: ${os.hostname()}`);
  });
});