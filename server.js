const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Get all cocktails
app.get('/api/cocktails', (req, res) => {
  db.all('SELECT * FROM cocktails', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else {
      // Parse ingredienti da JSON string ad array
      const cocktails = rows.map(row => ({
        ...row,
        ingredienti: JSON.parse(row.ingredienti)
      }));
      res.json(cocktails);
    }
  });
});

// Get single cocktail by ID
app.get('/api/cocktails/:id', (req, res) => {
  db.get('SELECT * FROM cocktails WHERE id = ?', [req.params.id], (err, row) => {
    if (err) res.status(500).json({ error: err.message });
    else if (!row) res.status(404).json({ error: 'Not found' });
    else {
      row.ingredienti = JSON.parse(row.ingredienti);
      res.json(row);
    }
  });
});

// Get single cocktail by slug
app.get('/api/cocktails/slug/:slug', (req, res) => {
  db.get('SELECT * FROM cocktails WHERE slug = ?', [req.params.slug], (err, row) => {
    if (err) res.status(500).json({ error: err.message });
    else if (!row) res.status(404).json({ error: 'Not found' });
    else {
      row.ingredienti = JSON.parse(row.ingredienti);
      res.json(row);
    }
  });
});

// Add cocktail
app.post('/api/cocktails', (req, res) => {
  const { slug, nome, autore, luogo, anno, ingredienti, metodo, bicchiere, ghiaccio, garnish, note, image } = req.body;
  
  db.run(
    'INSERT INTO cocktails (slug, nome, autore, luogo, anno, ingredienti, metodo, bicchiere, ghiaccio, garnish, note, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [slug, nome, autore, luogo, anno, JSON.stringify(ingredienti), metodo, bicchiere, ghiaccio, garnish, note, image],
    function(err) {
      if (err) res.status(400).json({ error: err.message });
      else res.status(201).json({ id: this.lastID, slug, nome, autore, luogo, anno, ingredienti, metodo, bicchiere, ghiaccio, garnish, note, image });
    }
  );
});

// Update cocktail
app.put('/api/cocktails/:id', (req, res) => {
  const { slug, nome, autore, luogo, anno, ingredienti, metodo, bicchiere, ghiaccio, garnish, note, image } = req.body;
  
  db.run(
    'UPDATE cocktails SET slug = ?, nome = ?, autore = ?, luogo = ?, anno = ?, ingredienti = ?, metodo = ?, bicchiere = ?, ghiaccio = ?, garnish = ?, note = ?, image = ? WHERE id = ?',
    [slug, nome, autore, luogo, anno, JSON.stringify(ingredienti), metodo, bicchiere, ghiaccio, garnish, note, image, req.params.id],
    function(err) {
      if (err) res.status(400).json({ error: err.message });
      else res.json({ id: req.params.id, slug, nome, autore, luogo, anno, ingredienti, metodo, bicchiere, ghiaccio, garnish, note, image });
    }
  );
});

// Delete cocktail
app.delete('/api/cocktails/:id', (req, res) => {
  db.run('DELETE FROM cocktails WHERE id = ?', [req.params.id], function(err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ ok: true, deleted: this.changes });
  });
});

// =========================
// INVENTARIO BOTTIGLIE
// =========================

// Get all inventory items
app.get('/api/inventory', (req, res) => {
  const sql = `
    SELECT ii.*, ing.name AS ingredient_name
    FROM inventory_items ii
    JOIN ingredients ing ON ing.id = ii.ingredient_id
    WHERE ii.is_active = 1
    ORDER BY ing.name, ii.brand
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single inventory item
app.get('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT ii.*, ing.name AS ingredient_name
    FROM inventory_items ii
    JOIN ingredients ing ON ing.id = ii.ingredient_id
    WHERE ii.id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Create inventory item
app.post('/api/inventory', (req, res) => {
  const {
    ingredient_id,
    brand,
    label_name,
    barcode,
    bottle_size_ml,
    bottle_type,
    origin_country,
    region,
    style,
    abv,
    current_level_fraction,
    current_level_ml,
    condition,
    location,
    storage_notes,
    opened_at,
    purchase_price,
    purchase_currency,
    purchase_date,
    supplier,
    par_level_bottles,
    reorder_point_bottles,
    reorder_qty_bottles,
    status,
    is_collectible,
    personal_rating,
    tasting_notes
  } = req.body;

  const sql = `
    INSERT INTO inventory_items (
      ingredient_id, brand, label_name, barcode,
      bottle_size_ml, bottle_type, origin_country, region, style, abv,
      current_level_fraction, current_level_ml, condition, location, storage_notes, opened_at,
      purchase_price, purchase_currency, purchase_date, supplier,
      par_level_bottles, reorder_point_bottles, reorder_qty_bottles, status,
      is_collectible, personal_rating, tasting_notes, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  const params = [
    ingredient_id, brand, label_name, barcode,
    bottle_size_ml, bottle_type, origin_country, region, style, abv,
    current_level_fraction, current_level_ml, condition, location, storage_notes, opened_at,
    purchase_price, purchase_currency, purchase_date, supplier,
    par_level_bottles, reorder_point_bottles, reorder_qty_bottles, status,
    is_collectible, personal_rating, tasting_notes
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
});

// Update inventory item
app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const fields = [
    'ingredient_id','brand','label_name','barcode',
    'bottle_size_ml','bottle_type','origin_country','region','style','abv',
    'current_level_fraction','current_level_ml','condition','location','storage_notes','opened_at',
    'purchase_price','purchase_currency','purchase_date','supplier',
    'par_level_bottles','reorder_point_bottles','reorder_qty_bottles','status',
    'is_collectible','personal_rating','tasting_notes'
  ];

  const setClauses = [];
  const params = [];

  fields.forEach(f => {
    if (Object.prototype.hasOwnProperty.call(body, f)) {
      setClauses.push(`${f} = ?`);
      params.push(body[f]);
    }
  });

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const sql = `
    UPDATE inventory_items
    SET ${setClauses.join(', ')}, updated_at = datetime('now')
    WHERE id = ?
  `;
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

// Soft delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    UPDATE inventory_items
    SET is_active = 0, updated_at = datetime('now')
    WHERE id = ?
  `;
  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

// Cocktail completamente fattibili con l'inventario attuale
app.get('/api/cocktails/available', (req, res) => {
  const sql = `
    SELECT c.*
    FROM cocktails c
    JOIN cocktail_ingredients ci ON ci.cocktail_id = c.id
    LEFT JOIN inventory_items ii
      ON ii.ingredient_id = ci.ingredient_id
      AND ii.status IN ('in_stock', 'low')
      AND ii.is_active = 1
    GROUP BY c.id
    HAVING COUNT(DISTINCT ci.ingredient_id) = COUNT(DISTINCT ii.ingredient_id)
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server su http://localhost:${PORT}`));
