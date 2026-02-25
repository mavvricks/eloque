const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);
const row = db.prepare("SELECT id, selected_menu FROM bookings ORDER BY id DESC LIMIT 1").get();
console.log(JSON.stringify(row, null, 2));
db.close();
