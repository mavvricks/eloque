const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('Initializing Database...');

// Execute Schema
db.exec(schema);

// Seed Data
const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)
`);

const seedUsers = [
    { username: 'superadmin', role: 'SuperAdmin' },
    { username: 'admin', role: 'Admin' },
    { username: 'ops', role: 'Operations' },
    { username: 'client', role: 'Client' }
];

const SALT_ROUNDS = 10;
const DEFAULT_PASS = 'password123';

(async () => {
    const hashedPassword = await bcrypt.hash(DEFAULT_PASS, SALT_ROUNDS);

    seedUsers.forEach(user => {
        const info = insertUser.run(user.username, hashedPassword, user.role);
        if (info.changes > 0) {
            console.log(`Created user: ${user.username}`);
        } else {
            console.log(`User already exists: ${user.username}`);
        }
    });

    console.log('Database initialization complete.');
})();
