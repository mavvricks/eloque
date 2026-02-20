const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

console.log("Checking Users Table Schema...");
const usersInfo = db.prepare("PRAGMA table_info(users)").all();
// To check constraints we need to look at sqlite_master
const usersSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
console.log(usersSql.sql);

console.log("\nChecking Payments Table Schema...");
const paymentsInfo = db.prepare("PRAGMA table_info(payments)").all();
console.log(paymentsInfo);

console.log("\nChecking Users Data...");
const users = db.prepare("SELECT * FROM users").all();
console.log(JSON.stringify(users, null, 2));

console.log("\nChecking Payments Data...");
const payments = db.prepare("SELECT * FROM payments").all();
console.log(JSON.stringify(payments, null, 2));
