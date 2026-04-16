require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка CORS - ПОЛНАЯ
app.use(cors({
  origin: '*', // Разрешаем все источники
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Обрабатываем preflight OPTIONS запросы
app.options('*', cors());

app.use(express.json());

// Добавляем middleware для логирования и CORS заголовков
app.use((req, res, next) => {
  // Устанавливаем CORS заголовки для каждого ответа
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Логируем запросы
  console.log(`[${os.hostname()}] ${req.method} ${req.path}`, req.body);
  
  next();
});

// PostgreSQL подключение
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'family_shop',
});

// Инициализация таблиц
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

    console.log('Database initialized with test data');
  } catch (error) {
    console.error('Database init error:', error);
  } finally {
    client.release();
  }
}

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    hostname: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/family-members', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM family_members ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart/add', async (req, res) => {
  console.log('POST /api/cart/add - Request body:', req.body);
  
  const { product_id, member_id } = req.body;
  
  if (!product_id || !member_id) {
    return res.status(400).json({ 
      error: 'Missing required fields: product_id and member_id' 
    });
  }
  
  try {
    // Проверяем, существует ли уже такой товар в корзине у участника
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE product_id = $1 AND member_id = $2',
      [product_id, member_id]
    );
    
    if (existing.rows.length > 0) {
      // Обновляем количество
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + 1 WHERE product_id = $1 AND member_id = $2',
        [product_id, member_id]
      );
    } else {
      // Добавляем новый товар
      await pool.query(
        'INSERT INTO cart_items (product_id, member_id) VALUES ($1, $2)',
        [product_id, member_id]
      );
    }
    
    // Обновляем счётчик товаров у участника
    await pool.query(
      'UPDATE family_members SET items_count = items_count + 1 WHERE id = $1',
      [member_id]
    );
    
    res.json({ success: true, message: 'Product added to cart' });
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
    console.log(`CORS enabled for all origins`);
  });
});