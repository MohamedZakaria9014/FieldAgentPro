const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const DB_PATH = path.join(__dirname, 'db.json');
const SEED_PATH = path.join(__dirname, 'mockShipments.json');

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function ensureDb() {
  const current = readJson(DB_PATH, null);
  if (current && Array.isArray(current.shipments)) return;
  const seed = readJson(SEED_PATH, { shipments: [] });
  writeJson(DB_PATH, seed);
}

ensureDb();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/reset-shipments', (req, res) => {
  try {
    const seed = readJson(SEED_PATH, { shipments: [] });
    writeJson(DB_PATH, seed);
    res.json({
      ok: true,
      count: Array.isArray(seed.shipments) ? seed.shipments.length : 0,
    });
    console.log('🗃️ Shipments database reset to mock data');
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.delete('/shipments/:id', (req, res) => {
  try {
    const orderId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ ok: false, error: 'Invalid id' });
    }

    const data = readJson(DB_PATH, { shipments: [] });
    const before = Array.isArray(data.shipments) ? data.shipments.length : 0;
    const filtered = (data.shipments ?? []).filter(s => s.order_id !== orderId);

    writeJson(DB_PATH, { shipments: filtered });

    const after = filtered.length;
    const deleted = before - after;

    console.log(
      `🗑️ Shipment ${orderId} deleted from db.json (deleted=${deleted})`,
    );
    return res.json({ ok: true, deleted });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get('/shipments', (req, res) => {
  const db = readJson(DB_PATH, { shipments: [] });
  res.json(Array.isArray(db.shipments) ? db.shipments : []);
  console.log('📦 Shipments data sent');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Mock Server running at http://localhost:3000');
  console.log('📱 Android emulator: http://10.0.2.2:3000/shipments');
});
