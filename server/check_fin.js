const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, 'db/database.sqlite'));
const user = db.prepare('SELECT id, username, role FROM users WHERE username = ?').get('fin');
console.log('FIN USER:', JSON.stringify(user));
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
console.log('SCHEMA:', schema.sql);
db.close();
