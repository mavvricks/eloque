const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new Database(dbPath);

console.log('Resolving superadmin conflict...');
const existingSuperadmin = db.prepare('SELECT id FROM users WHERE username = ?').get('superadmin');
if (existingSuperadmin) {
    db.prepare('DELETE FROM users WHERE username = ?').run('superadmin');
    console.log('Deleted existing superadmin to make room for admin.');
}

const updateAdmin = db.prepare(`UPDATE users SET username = 'superadmin', role = 'SuperAdmin' WHERE username = 'admin'`);
const adminRes = updateAdmin.run();
console.log(`Updated admin to superadmin: ${adminRes.changes} rows changed.`);

const updateFin = db.prepare(`UPDATE users SET username = 'accounting' WHERE username = 'fin'`);
const finRes = updateFin.run();
console.log(`Updated fin to accounting: ${finRes.changes} rows changed.`);

console.log('Final Users:');
const users = db.prepare('SELECT id, username, role FROM users').all();
console.log(users);
