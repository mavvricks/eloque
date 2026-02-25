const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

try {
    console.log("Starting database schema updates for Superadmin features...");

    // 1. Create pricing_overrides table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS pricing_overrides (
            id TEXT PRIMARY KEY,
            item_type TEXT CHECK(item_type IN ('package', 'dish')) NOT NULL,
            item_id TEXT NOT NULL,
            new_price DECIMAL(10, 2) NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
    console.log("Verified/Created pricing_overrides table.");

    // 2. Alter bookings table to add discount columns if they don't exist
    const tableInfo = db.prepare("PRAGMA table_info(bookings)").all();
    const hasDiscountValue = tableInfo.some(col => col.name === 'discount_value');
    const hasDiscountType = tableInfo.some(col => col.name === 'discount_type');

    if (!hasDiscountValue) {
        db.prepare("ALTER TABLE bookings ADD COLUMN discount_value DECIMAL(10, 2) DEFAULT 0").run();
        console.log("Added discount_value column to bookings.");
    }

    if (!hasDiscountType) {
        db.prepare("ALTER TABLE bookings ADD COLUMN discount_type TEXT DEFAULT 'fixed'").run();
        console.log("Added discount_type column to bookings.");
    }

    console.log("Database schema updates completed successfully.");

} catch (error) {
    console.error("Error updating database schema:", error);
} finally {
    db.close();
}
