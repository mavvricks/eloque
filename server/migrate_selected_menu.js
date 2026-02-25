const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

console.log("Starting database migration for selected_menu...");

try {
    // 1. Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(bookings)").all();
    const hasSelectedMenu = tableInfo.some(column => column.name === 'selected_menu');

    if (!hasSelectedMenu) {
        console.log("Adding selected_menu column to bookings table...");
        db.prepare("ALTER TABLE bookings ADD COLUMN selected_menu TEXT").run();
        console.log("Successfully added selected_menu column.");
    } else {
        console.log("Column selected_menu already exists in bookings table. Skipping.");
    }

    console.log("Migration completed successfully.");
} catch (error) {
    console.error("Migration failed:", error);
} finally {
    db.close();
}
