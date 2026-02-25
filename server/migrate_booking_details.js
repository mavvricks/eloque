const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new Database(dbPath);

console.log("Starting DB migration for Event Details enhancements...");

try {
    // Check if columns exist
    const columns = db.pragma('table_info(bookings)');
    const hasOutsourced = columns.some(c => c.name === 'outsourced_services');
    const hasTheme = columns.some(c => c.name === 'theme_uploads');
    const hasSpecial = columns.some(c => c.name === 'special_instructions');

    if (!hasOutsourced) {
        db.exec("ALTER TABLE bookings ADD COLUMN outsourced_services TEXT;");
        console.log("Added outsourced_services column");
    }

    if (!hasTheme) {
        db.exec("ALTER TABLE bookings ADD COLUMN theme_uploads TEXT;");
        console.log("Added theme_uploads column");
    }

    if (!hasSpecial) {
        db.exec("ALTER TABLE bookings ADD COLUMN special_instructions TEXT;");
        console.log("Added special_instructions column");
    }

    console.log("Migration completed successfully.");

    // Update schema.sql as well
    const fs = require('fs');
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    if (!schema.includes('outsourced_services TEXT')) {
        schema = schema.replace(
            /(status TEXT DEFAULT 'Pending',)/,
            "$1\n    outsourced_services TEXT,\n    theme_uploads TEXT,\n    special_instructions TEXT,"
        );
        fs.writeFileSync(schemaPath, schema);
        console.log("Updated schema.sql");
    }

} catch (e) {
    console.error("Migration failed:", e);
}
