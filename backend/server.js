const express = require('express')
const cors = require('cors')
const path = require('node:path')
const { DatabaseSync } = require('node:sqlite')

const app = express()
app.use(cors())
app.use(express.json())

const db = new DatabaseSync(path.join(__dirname, 'foodlink.db'))

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS surpluses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_item TEXT NOT NULL,
    donor TEXT NOT NULL,
    portions INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS needs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization TEXT NOT NULL,
    food_needed TEXT NOT NULL,
    portions_needed INTEGER NOT NULL,
    needed_by TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS delivery_partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    available INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surplus_id INTEGER REFERENCES surpluses(id),
    need_id INTEGER REFERENCES needs(id),
    partner_id INTEGER REFERENCES delivery_partners(id),
    portions INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Matched',
    eta TEXT,
    arrived_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`)

// Purani database mein columns missing hon to add karo.
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all()

  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

ensureColumn('deliveries', 'partner_id', 'INTEGER')
ensureColumn('deliveries', 'arrived_at', 'TEXT')

// Demo delivery partners.
const addPartner = db.prepare(`
  INSERT INTO delivery_partners (name, available)
  VALUES (?, 1)
  ON CONFLICT(name) DO UPDATE SET available = 1
`)

addPartner.run('Demo partner — North route')
addPartner.run('Demo partner — Central route')
addPartner.run('Demo partner — South route')

function foodCategory(value) {
  const text = String(value || '').toLowerCase()

  if (/\b(cooked|meal|meals|pulao|biryani|rice|khichdi|curry|dal|bowl|box)\b/.test(text)) {
    return 'prepared-meal'
  }

  if (/\b(vegetable|vegetables|fruit|fruits|produce|salad|apple|banana|orange)\b/.test(text)) {
    return 'produce'
  }

  if (/\b(bread|bakery|cake|bun|pastry)\b/.test(text)) {
    return 'bakery'
  }

  if (/\b(milk|dairy|yogurt|curd|paneer|cheese)\b/.test(text)) {
    return 'dairy'
  }

  return null
}

function foodMatches(surplusFood, requestedFood) {
  const supplyCategory = foodCategory(surplusFood)
  const needCategory = foodCategory(requestedFood)

  if (supplyCategory || needCategory) {
    return supplyCategory === needCategory
  }

  const ignoredWords = new Set(['food', 'item', 'need', 'fresh', 'any'])
  const supplyWords = String(surplusFood).toLowerCase().match(/[a-z]+/g) || []
  const needWords = String(requestedFood).toLowerCase().match(/[a-z]+/g) || []

  return needWords.some(
    (word) => !ignoredWords.has(word) && supplyWords.includes(word)
  )
}

function availableSurplusPortions(id) {
  const used = db.prepare(`
    SELECT COALESCE(SUM(portions), 0) AS used
    FROM deliveries
    WHERE surplus_id = ? AND status <> 'Cancelled'
  `).get(id)

  const surplus = db.prepare(
    'SELECT portions FROM surpluses WHERE id = ?'
  ).get(id)

  return Number(surplus?.portions || 0) - Number(used?.used || 0)
}

function availableNeedPortions(id) {
  const used = db.prepare(`
    SELECT COALESCE(SUM(portions), 0) AS used
    FROM deliveries
    WHERE need_id = ? AND status <> 'Cancelled'
  `).get(id)

  const need = db.prepare(
    'SELECT portions_needed FROM needs WHERE id = ?'
  ).get(id)

  return Number(need?.portions_needed || 0) - Number(used?.used || 0)
}

function findAvailablePartner(excludedPartnerId = null) {
  return db.prepare(`
    SELECT partners.*
    FROM delivery_partners AS partners
    WHERE partners.available = 1
      AND (? IS NULL OR partners.id <> ?)
      AND NOT EXISTS (
        SELECT 1
        FROM deliveries
        WHERE deliveries.partner_id = partners.id
          AND deliveries.status NOT LIKE 'Delivered%'
          AND deliveries.status NOT IN ('Cancelled', 'Reassignment needed')
      )
    ORDER BY partners.id
    LIMIT 1
  `).get(excludedPartnerId, excludedPartnerId)
}

// Demo ETA 30 minutes hai; form addresses leta hai, map route nahi.
function feasibleEta(surplus, need) {
  const eta = new Date(Date.now() + 30 * 60 * 1000)
  const expiry = new Date(surplus.expires_at)
  const deadline = new Date(need.needed_by)

  if (
    Number.isNaN(expiry.getTime()) ||
    Number.isNaN(deadline.getTime()) ||
    eta >= expiry ||
    eta > deadline
  ) {
    return null
  }

  return eta.toISOString()
}

function createMatches() {
  const needs = db.prepare(
    'SELECT * FROM needs ORDER BY needed_by ASC'
  ).all()

  const surpluses = db.prepare(
    'SELECT * FROM surpluses ORDER BY expires_at ASC'
  ).all()

  for (const need of needs) {
    let portionsNeeded = availableNeedPortions(need.id)

    if (portionsNeeded <= 0) continue

    for (const surplus of surpluses) {
      if (portionsNeeded <= 0) break
      if (!foodMatches(surplus.food_item, need.food_needed)) continue

      const portionsAvailable = availableSurplusPortions(surplus.id)
      if (portionsAvailable <= 0) continue

      const eta = feasibleEta(surplus, need)
      if (!eta) continue

      const partner = findAvailablePartner()
      if (!partner) return

      const portions = Math.min(portionsAvailable, portionsNeeded)

      db.prepare(`
        INSERT INTO deliveries
          (surplus_id, need_id, partner_id, portions, status, eta)
        VALUES (?, ?, ?, ?, 'Matched', ?)
      `).run(surplus.id, need.id, partner.id, portions, eta)

      portionsNeeded -= portions
    }
  }
}

const deliverySelect = `
  SELECT
    deliveries.*,
    surpluses.food_item,
    surpluses.donor,
    surpluses.expires_at,
    needs.organization,
    needs.delivery_location,
    needs.needed_by,
    delivery_partners.name AS partner_name
  FROM deliveries
  LEFT JOIN surpluses ON deliveries.surplus_id = surpluses.id
  LEFT JOIN needs ON deliveries.need_id = needs.id
  LEFT JOIN delivery_partners ON deliveries.partner_id = delivery_partners.id
`

function getDelivery(id) {
  return db.prepare(`${deliverySelect} WHERE deliveries.id = ?`).get(id)
}

app.get('/', (req, res) => {
  res.send('FoodLink backend is running. Open /api/health to check it.')
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'FoodLink API is running' })
})

app.get('/api/surpluses', (req, res) => {
  res.json(db.prepare('SELECT * FROM surpluses ORDER BY id DESC').all())
})

app.post('/api/surpluses', (req, res) => {
  const { foodItem, donor, portions, expiresAt, pickupLocation } = req.body

  if (
    !foodItem ||
    !donor ||
    !Number.isInteger(Number(portions)) ||
    Number(portions) < 1 ||
    !expiresAt ||
    !pickupLocation
  ) {
    return res.status(400).json({ error: 'Please fill in all surplus fields.' })
  }

  const result = db.prepare(`
    INSERT INTO surpluses
      (food_item, donor, portions, expires_at, pickup_location)
    VALUES (?, ?, ?, ?, ?)
  `).run(foodItem, donor, Number(portions), expiresAt, pickupLocation)

  createMatches()

  const saved = db.prepare(
    'SELECT * FROM surpluses WHERE id = ?'
  ).get(Number(result.lastInsertRowid))

  res.status(201).json(saved)
})

app.get('/api/needs', (req, res) => {
  res.json(db.prepare('SELECT * FROM needs ORDER BY id DESC').all())
})

app.post('/api/needs', (req, res) => {
  const {
    organization,
    foodNeeded,
    portionsNeeded,
    neededBy,
    deliveryLocation,
  } = req.body

  if (
    !organization ||
    !foodNeeded ||
    !Number.isInteger(Number(portionsNeeded)) ||
    Number(portionsNeeded) < 1 ||
    !neededBy ||
    !deliveryLocation
  ) {
    return res.status(400).json({ error: 'Please fill in all food-need fields.' })
  }

  const result = db.prepare(`
    INSERT INTO needs
      (organization, food_needed, portions_needed, needed_by, delivery_location)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    organization,
    foodNeeded,
    Number(portionsNeeded),
    neededBy,
    deliveryLocation
  )

  createMatches()

  const saved = db.prepare(
    'SELECT * FROM needs WHERE id = ?'
  ).get(Number(result.lastInsertRowid))

  res.status(201).json(saved)
})

app.get('/api/deliveries', (req, res) => {
  res.json(
    db.prepare(`${deliverySelect} ORDER BY deliveries.id DESC`).all()
  )
})

app.post('/api/deliveries/:id/reassign', (req, res) => {
  const id = Number(req.params.id)
  const delivery = db.prepare(
    'SELECT * FROM deliveries WHERE id = ?'
  ).get(id)

  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found.' })
  }

  if (delivery.status.startsWith('Delivered')) {
    return res.status(400).json({ error: 'This delivery is already complete.' })
  }

  const surplus = db.prepare(
    'SELECT * FROM surpluses WHERE id = ?'
  ).get(delivery.surplus_id)

  const need = db.prepare(
    'SELECT * FROM needs WHERE id = ?'
  ).get(delivery.need_id)

  const partner = findAvailablePartner(delivery.partner_id)
  const eta = feasibleEta(surplus, need)

  if (!partner || !eta) {
    db.prepare(`
      UPDATE deliveries
      SET partner_id = NULL, eta = NULL, status = 'Reassignment needed'
      WHERE id = ?
    `).run(id)

    return res.json({
      ...getDelivery(id),
      message: 'No alternate demo partner is available right now.',
    })
  }

  db.prepare(`
    UPDATE deliveries
    SET partner_id = ?, eta = ?, status = 'Reassigned', arrived_at = NULL
    WHERE id = ?
  `).run(partner.id, eta, id)

  res.json({
    ...getDelivery(id),
    message: `Reassigned to ${partner.name}.`,
  })
})

app.post('/api/deliveries/:id/arrived', (req, res) => {
  const id = Number(req.params.id)
  const delivery = getDelivery(id)

  if (!delivery) {
    return res.status(404).json({ error: 'Delivery not found.' })
  }

  const arrivedAt = new Date()
  const expiry = new Date(delivery.expires_at)
  const onTime = !Number.isNaN(expiry.getTime()) && arrivedAt <= expiry
  const status = onTime ? 'Delivered before expiry' : 'Delivered after expiry'

  db.prepare(`
    UPDATE deliveries
    SET status = ?, arrived_at = ?
    WHERE id = ?
  `).run(status, arrivedAt.toISOString(), id)

  createMatches()

  res.json({
    ...getDelivery(id),
    on_time: onTime,
    message: onTime
      ? 'Arrival recorded before expiry.'
      : 'Arrival recorded after expiry.',
  })
})

// Purani saved entries ko bhi server start par match karo.
createMatches()

app.listen(3001, () => {
  console.log('FoodLink API running at http://localhost:3001')
})