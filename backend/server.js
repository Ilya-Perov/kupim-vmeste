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

/* ================= REDIS ================= */

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

/* ================= POSTGRES ================= */

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'family_shop',
});

/* ================= GLOBAL MIDDLEWARE ================= */

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
  requestCount++;

  console.log(`[${instanceId}] ${req.method} ${req.url}`);

  res.setHeader('X-Instance-Id', instanceId);
  res.setHeader('X-Request-Count', requestCount);

  next();
});

/* ================= DB INIT ================= */

async function initDB() {
  const client = await pool.connect();

  try {
    // PRODUCTS
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

    // FAMILY MEMBERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS family_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar VARCHAR(10),
        items_count INTEGER DEFAULT 0
      )
    `);

    // CART
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        member_id INTEGER REFERENCES family_members(id),
        quantity INTEGER DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // STATE
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // USERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        family_member_id INTEGER REFERENCES family_members(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /* ================= SEED FAMILY MEMBERS FIRST ================= */

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

    /* ================= GET REAL IDs ================= */

    const members = await client.query(`
      SELECT id, name FROM family_members ORDER BY id
    `);

    const annaId = members.rows.find(m => m.name === 'Анна')?.id;
    const alexeyId = members.rows.find(m => m.name === 'Алексей')?.id;

    /* ================= SEED USERS SAFELY ================= */

    const usersCount = await client.query('SELECT COUNT(*) FROM users');

    if (parseInt(usersCount.rows[0].count) === 0 && annaId && alexeyId) {
      await client.query(`
        INSERT INTO users (username, password_hash, family_member_id) VALUES
        ('anna', 'test123', $1),
        ('alexey', 'test123', $2)
      `, [annaId, alexeyId]);
    }

    console.log('Database initialized');

  } catch (err) {
    console.error('DB init error:', err);
  } finally {
    client.release();
  }
}

/* ================= SESSION SETUP (AFTER REDIS CONNECT) ================= */

async function setupSession() {
  await redisClient.connect();
  console.log('Redis connected');

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
}

/* ================= AUTH ================= */

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
      user: { id: user.id, username: user.username },
      hostname: os.hostname()
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
    },
    hostname: os.hostname()
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

/* ================= OTHER API ================= */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    instance: instanceId,
    hostname: os.hostname(),
    uptime: process.uptime(),
    requests: requestCount
  });
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/family-members', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM family_members ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= BOOT ================= */

async function start() {
  try {
    await setupSession();
    await initDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🖥 Host: ${os.hostname()}`);
    });

  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

start();