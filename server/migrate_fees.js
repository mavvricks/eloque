const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, './db/database.sqlite');
const db = new Database(dbPath);

const migrations = [
    "ALTER TABLE bookings ADD COLUMN transport_fee DECIMAL(10, 2) DEFAULT 0",
    "ALTER TABLE bookings ADD COLUMN labor_surcharge DECIMAL(10, 2) DEFAULT 0"
];

console.log("Running bookings table fee migrations...");

for (const sql of migrations) {
    try {
        db.exec(sql);
        console.log(`  ✓ ${sql}`);
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log(`  - Skipped (already exists): ${sql}`);
        } else {
            console.error(`  ✗ Failed: ${sql}`, err.message);
        }
    }
}

console.log("Fee migration complete!");
db.close();
