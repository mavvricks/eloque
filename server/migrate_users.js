const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, './db/database.sqlite'));

const migrations = [
    'ALTER TABLE users ADD COLUMN email TEXT',
    'ALTER TABLE users ADD COLUMN phone TEXT'
];

for (const sql of migrations) {
    try {
        db.exec(sql);
        console.log('OK:', sql);
    } catch (e) {
        if (e.message.includes('duplicate')) {
            console.log('Skip:', sql);
        } else {
            console.error('FAIL:', sql, e.message);
        }
    }
}

db.close();
console.log('Done');
