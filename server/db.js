const fs = require('fs');
const path = require('path');

// On Render with persistent disk, DATA_DIR=/data
// Locally, falls back to server directory
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_FILE = path.join(DATA_DIR, 'data.json');

const DEFAULT_DATA = { volunteers: [], tasks: [], slots: [], log: [] };

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error('[DB] Error loading:', err.message);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function saveDB(data) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }
  catch (err) { console.error('[DB] Error saving:', err.message); }
}

function getAll(table) { return loadDB()[table] || []; }
function getById(table, id) { return getAll(table).find(i => String(i.id) === String(id)) || null; }

function insert(table, item) {
  const data = loadDB();
  if (!data[table]) data[table] = [];
  const newItem = { ...item, id: Date.now().toString() };
  data[table].unshift(newItem);
  if (table === 'log' && data.log.length > 500) data.log = data.log.slice(0, 500);
  saveDB(data);
  return newItem;
}

function update(table, id, changes) {
  const data = loadDB();
  const idx = (data[table] || []).findIndex(i => String(i.id) === String(id));
  if (idx === -1) return null;
  data[table][idx] = { ...data[table][idx], ...changes };
  saveDB(data);
  return data[table][idx];
}

function remove(table, id) {
  const data = loadDB();
  data[table] = (data[table] || []).filter(i => String(i.id) !== String(id));
  saveDB(data);
}

module.exports = { getAll, getById, insert, update, remove, DB_FILE };
