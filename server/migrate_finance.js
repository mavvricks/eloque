const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

console.log("Starting migration for Finance Module...");

// 1. Update Users Table to include 'Finance' role
try {
    db.exec('BEGIN TRANSACTION');

    // Check if 'Finance' role is already allowed (by checking structure or just trial, but robust way is recreate)
    // We will recreate to be safe and clean.

    console.log("Migrating users table...");
    db.exec(`CREATE TABLE IF NOT EXISTS users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK( role IN ('SuperAdmin', 'Admin', 'Operations', 'Client', 'Finance') ) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.exec(`INSERT INTO users_new (id, username, password, role, created_at) SELECT id, username, password, role, created_at FROM users`);
    db.exec(`DROP TABLE users`);
    db.exec(`ALTER TABLE users_new RENAME TO users`);

    console.log("Users table migrated successfully.");

    // 2. Update Payments Table to include 'proof_image'
    console.log("Migrating payments table...");
    // Check if column exists first to avoid error
    const tableInfo = db.prepare('PRAGMA table_info(payments)').all();
    const hasProofImage = tableInfo.some(col => col.name === 'proof_image');

    if (!hasProofImage) {
        db.exec(`ALTER TABLE payments ADD COLUMN proof_image TEXT`);
        console.log("Added proof_image column to payments.");
    } else {
        console.log("proof_image column already exists.");
    }

    db.exec('COMMIT');
    console.log("Migration completed successfully.");

} catch (error) {
    console.error("Migration failed:", error);
    if (db.inTransaction) db.exec('ROLLBACK');
}
