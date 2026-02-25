const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new Database(dbPath);

console.log("Starting DB migration to rename roles...");

// 1. Disable PRAGMA foreign_keys so we can safely rebuild the users table
db.pragma('foreign_keys = OFF');

// 2. Wrap in a transaction
const migrate = db.transaction(() => {
    // 3. Create the new users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            role TEXT CHECK( role IN ('Superadmin', 'Marketing', 'Accounting', 'Client') ) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 4. Move data from old users to new users with updated roles
    db.exec(`
        INSERT INTO users_new (id, username, password, email, phone, role, created_at)
        SELECT 
            id, username, password, email, phone,
            CASE role
                WHEN 'SuperAdmin' THEN 'Superadmin'
                WHEN 'Admin' THEN 'Superadmin'
                WHEN 'Operations' THEN 'Marketing'
                WHEN 'Finance' THEN 'Accounting'
                WHEN 'Client' THEN 'Client'
                ELSE role
            END,
            created_at
        FROM users
    `);

    // 5. Drop the old users table
    db.exec(`DROP TABLE users`);

    // 6. Rename the new table
    db.exec(`ALTER TABLE users_new RENAME TO users`);
});

try {
    migrate();
    console.log("Migration successful!");
} catch (e) {
    console.error("Migration failed:", e);
} finally {
    // 7. Re-enable PRAGMA foreign_keys
    db.pragma('foreign_keys = ON');
    // Ensure all PRAGMA checks pass
    const foreignKeyCheck = db.pragma('foreign_key_check');
    if (foreignKeyCheck.length > 0) {
        console.error("Foreign key violations found after migration:", foreignKeyCheck);
    } else {
        console.log("Foreign key check passed.");
    }
}
