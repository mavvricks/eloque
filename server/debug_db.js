const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

// Check PRAGMA foreign_keys
const fkStatus = db.pragma('foreign_keys');
console.log('Foreign keys PRAGMA:', fkStatus);

// Check actual bookings table schema
const tableInfo = db.prepare("PRAGMA table_info(bookings)").all();
console.log('\nBookings table columns:');
tableInfo.forEach(col => console.log(`  ${col.cid}: ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`));

// Check FK constraints on bookings
const fkList = db.prepare("PRAGMA foreign_key_list(bookings)").all();
console.log('\nBookings foreign keys:', JSON.stringify(fkList, null, 2));

// Check actual payments table schema
const paymentsInfo = db.prepare("PRAGMA table_info(payments)").all();
console.log('\nPayments table columns:');
paymentsInfo.forEach(col => console.log(`  ${col.cid}: ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PK' : ''}`));

const fkListPayments = db.prepare("PRAGMA foreign_key_list(payments)").all();
console.log('\nPayments foreign keys:', JSON.stringify(fkListPayments, null, 2));

// Check users
const users = db.prepare("SELECT id, username, role FROM users").all();
console.log('\nUsers:', JSON.stringify(users));

db.close();
