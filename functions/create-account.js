// Netlify function: create-account using sqlite3
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.resolve(__dirname, '../db.sqlite');

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

function ensureTable(db) {
  db.run(`CREATE TABLE IF NOT EXISTS accounts (
    guid TEXT PRIMARY KEY,
    phone TEXT,
    displayName TEXT UNIQUE,
    balance INTEGER,
    mockFlag INTEGER
  )`);
}

function generateGuid() {
  return 'xxxx-xxxx-xxxx'.replace(/[x]/g, () => ((Math.random()*36)|0).toString(36));
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { phone, displayName } = JSON.parse(event.body || '{}');
  if (!phone || !displayName) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing phone or displayName' }) };
  }
  return new Promise((resolve) => {
    const db = openDb();
    ensureTable(db);
    db.get('SELECT * FROM accounts WHERE displayName = ?', [displayName], (err, row) => {
      if (err) {
        db.close();
        resolve({ statusCode: 500, body: JSON.stringify({ error: 'DB error', details: err.message }) });
        return;
      }
      if (row) {
        db.close();
        resolve({ statusCode: 409, body: JSON.stringify({ error: 'Tên đã tồn tại.' }) });
        return;
      }
      const guid = generateGuid();
      const balance = 10000;
      const mockFlag = 0;
      db.run('INSERT INTO accounts (guid, phone, displayName, balance, mockFlag) VALUES (?, ?, ?, ?, ?)',
        [guid, phone, displayName, balance, mockFlag], function(insertErr) {
          db.close();
          if (insertErr) {
            resolve({ statusCode: 500, body: JSON.stringify({ error: 'DB error', details: insertErr.message }) });
            return;
          }
          resolve({
            statusCode: 200,
            body: JSON.stringify({ guid, phone, displayName, balance, mockFlag: false })
          });
        });
    });
  });
};
