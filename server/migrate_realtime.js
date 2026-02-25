const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

console.log("Starting database migration for real-time tracking and venue details...");

try {
    // Add live_status column
    try {
        db.prepare('ALTER TABLE bookings ADD COLUMN live_status TEXT DEFAULT "Not Started"').run();
        console.log("Successfully added 'live_status' column to 'bookings' table.");
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log("'live_status' column already exists.");
        } else {
            throw e;
        }
    }

    // Add venue_building_details column
    try {
        db.prepare('ALTER TABLE bookings ADD COLUMN venue_building_details TEXT').run();
        console.log("Successfully added 'venue_building_details' column to 'bookings' table.");
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log("'venue_building_details' column already exists.");
        } else {
            throw e;
        }
    }

    console.log("Migration completed successfully.");
} catch (error) {
    console.error("Migration failed:", error);
} finally {
    db.close();
}
