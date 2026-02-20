const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, 'db/database.sqlite'));
const tableInfo = db.prepare('PRAGMA table_info(bookings)').all();
const hasAddr = tableInfo.some(c => c.name === 'event_address');
if (!hasAddr) {
    db.exec('ALTER TABLE bookings ADD COLUMN event_address TEXT');
    console.log('Added event_address column');
} else {
    console.log('event_address already exists');
}
db.close();
