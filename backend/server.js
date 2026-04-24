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

// ---------------- MIDDLEWARE ----------------
app.use((req, res, next) => {
  requestCount++;

  console.log(`[${instanceId}] ${req.method} ${req.url}`);

  res.setHeader('X-Instance-Id', instanceId);
  res.setHeader('X-Request-Count', requestCount);

  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost',
  credentials: true
}));

app.use(express.json());

// ---------------- REDIS ----------------
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => console.error('Redis error:', err));

// ВАЖНО: connect только ОДИН раз
async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }
}

// ---------------- POSTGRES ----------------
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'family_shop',
});

// ---------------- SESSION ----------------
function setupSession() {
  app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86400000
    }
  }));
}

// ---------------- DB INIT ----------------
async function initDB() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        family_member_id INTEGER
      )
    `);

    const usersCount = await client.query('SELECT COUNT(*) FROM users');

    if (parseInt(usersCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (username, password_hash, family_member_id)
        VALUES ('anna', 'test123', 1)
      `);
    }

    console.log('DB ready');
  } finally {
    client.release();
  }
}

// ---------------- AUTH ----------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(
    'SELECT * FROM users WHERE username=$1 AND password_hash=$2',
    [username, password]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid' });
  }

  const user = result.rows[0];

  req.session.userId = user.id;

  res.json({
    success: true,
    user,
    instance: instanceId
  });
});

app.get('/api/me', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }

  const result = await pool.query(
    'SELECT id, username FROM users WHERE id=$1',
    [req.session.userId]
  );

  res.json({
    authenticated: true,
    user: result.rows[0],
    instance: instanceId
  });
});

// ---------------- HEALTH ----------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    instance: instanceId,
    uptime: process.uptime(),
    requestCount
  });
});

// ---------------- START ----------------
async function start() {
  await connectRedis();
  setupSession();
  await initDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend started on ${PORT}`);
  });
}

start();