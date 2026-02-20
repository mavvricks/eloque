const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, 'db/database.sqlite'));

console.log("Fixing role name from 'Financial' to 'Finance'...");

try {
    db.exec('BEGIN TRANSACTION');

    // Recreate users table with correct constraint
    db.exec(`CREATE TABLE IF NOT EXISTS users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK( role IN ('SuperAdmin', 'Admin', 'Operations', 'Client', 'Finance') ) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Copy data, replacing 'Financial' with 'Finance'
    db.exec(`INSERT INTO users_new (id, username, password, role, created_at) 
             SELECT id, username, password, 
                    CASE WHEN role = 'Financial' THEN 'Finance' ELSE role END, 
                    created_at 
             FROM users`);
    db.exec('DROP TABLE users');
    db.exec('ALTER TABLE users_new RENAME TO users');

    db.exec('COMMIT');

    // Verify
    const user = db.prepare('SELECT id, username, role FROM users WHERE username = ?').get('fin');
    console.log('FIN USER after fix:', JSON.stringify(user));
    const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
    console.log('SCHEMA after fix:', schema.sql);
    console.log("Done!");
} catch (error) {
    console.error("Error:", error);
    if (db.inTransaction) db.exec('ROLLBACK');
}

db.close();
