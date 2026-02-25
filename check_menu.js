const Database = require('better-sqlite3');
const db = new Database('./server/db/database.sqlite');
const row = db.prepare("SELECT id, selected_menu FROM bookings ORDER BY id DESC LIMIT 1").get();
console.log(row);
db.close();
