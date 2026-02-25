const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new Database(dbPath);

const users = db.prepare('SELECT id, username, role FROM users').all();
console.log(users);
