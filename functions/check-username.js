// Netlify function: check-username using sqlite3
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

function randomName() {
  return 'user' + Math.floor(Math.random() * 10000);
}

exports.handler = async function(event) {
  const displayName = event.queryStringParameters.displayName;
  if (!displayName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ available: false, error: 'Missing displayName' })
    };
  }
  return new Promise((resolve) => {
    const db = openDb();
    ensureTable(db);
    db.get('SELECT * FROM accounts WHERE displayName = ?', [displayName], (err, row) => {
      if (err) {
        db.close();
        resolve({ statusCode: 500, body: JSON.stringify({ available: false, error: 'DB error', details: err.message }) });
        return;
      }
      let suggestion = '';
      if (row) {
        let tries = 0;
        function trySuggest() {
          suggestion = randomName();
          db.get('SELECT * FROM accounts WHERE displayName = ?', [suggestion], (err2, row2) => {
            if (!row2 || tries >= 10) {
              db.close();
              resolve({ statusCode: 200, body: JSON.stringify({ available: false, suggestion }) });
            } else {
              tries++;
              trySuggest();
            }
          });
        }
        trySuggest();
      } else {
        db.close();
        resolve({ statusCode: 200, body: JSON.stringify({ available: true, suggestion: '' }) });
      }
    });
  });
};
