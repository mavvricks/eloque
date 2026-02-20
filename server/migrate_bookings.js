const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, './db/database.sqlite');
const db = new Database(dbPath);

const migrations = [
    // New fields from Step 5 (Event Details)
    "ALTER TABLE bookings ADD COLUMN client_full_name TEXT",
    "ALTER TABLE bookings ADD COLUMN venue_address_line TEXT",
    "ALTER TABLE bookings ADD COLUMN venue_street TEXT",
    "ALTER TABLE bookings ADD COLUMN venue_city TEXT",
    "ALTER TABLE bookings ADD COLUMN venue_province TEXT",
    "ALTER TABLE bookings ADD COLUMN venue_zip_code TEXT",
    // Fields editable from dashboard "My Events"
    "ALTER TABLE bookings ADD COLUMN reservation_time TEXT",
    "ALTER TABLE bookings ADD COLUMN serving_time TEXT",
    "ALTER TABLE bookings ADD COLUMN event_timeline TEXT",
    "ALTER TABLE bookings ADD COLUMN color_motif TEXT",
    // Optional food tasting link
    "ALTER TABLE bookings ADD COLUMN food_tasting_id INTEGER"
];

console.log("Running bookings table migrations...");

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

console.log("Migration complete!");
db.close();
