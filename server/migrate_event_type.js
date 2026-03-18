const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

console.log('Adding event_type column to bookings table...');

try {
    db.exec(`ALTER TABLE bookings ADD COLUMN event_type TEXT`);
    console.log('✅ event_type column added successfully.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('ℹ️  event_type column already exists, skipping.');
    } else {
        console.error('❌ Error:', err.message);
    }
}

db.close();
console.log('Done.');
