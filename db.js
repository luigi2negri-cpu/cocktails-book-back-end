const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'cocktails.db'), (err) => {
  if (err) console.error('DB error:', err);
  else console.log('Connected to SQLite');
});

// 1) Tabella cocktail (come già avevi)
db.run(`
  CREATE TABLE IF NOT EXISTS cocktails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    autore TEXT,
    luogo TEXT,
    anno TEXT,
    ingredienti TEXT NOT NULL,
    metodo TEXT,
    bicchiere TEXT,
    ghiaccio TEXT,
    garnish TEXT,
    note TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 2) Tabella ingredienti normalizzati
db.run(`
  CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    style TEXT,
    abv REAL
  )
`);

// 3) Relazione cocktail–ingredienti
db.run(`
  CREATE TABLE IF NOT EXISTS cocktail_ingredients (
    cocktail_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    amount TEXT,
    unit TEXT,
    order_index INTEGER,
    PRIMARY KEY (cocktail_id, ingredient_id),
    FOREIGN KEY (cocktail_id) REFERENCES cocktails(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
  )
`);

// 4) Tabella inventario bottiglie (con codice a barre)
db.run(`
  CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    brand TEXT,
    label_name TEXT,
    barcode TEXT,
    bottle_size_ml INTEGER,
    bottle_type TEXT,
    origin_country TEXT,
    region TEXT,
    style TEXT,
    abv REAL,

    current_level_fraction REAL DEFAULT 1.0,
    current_level_ml REAL,
    condition TEXT,
    location TEXT,
    storage_notes TEXT,
    is_active INTEGER DEFAULT 1,
    opened_at TEXT,

    purchase_price REAL,
    purchase_currency TEXT,
    purchase_date TEXT,
    supplier TEXT,

    par_level_bottles REAL,
    reorder_point_bottles REAL,
    reorder_qty_bottles REAL,
    status TEXT,
    last_count_at TEXT,

    is_collectible INTEGER DEFAULT 0,
    personal_rating REAL,
    tasting_notes TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,

    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
  )
`);

module.exports = db;
