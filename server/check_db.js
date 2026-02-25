const db = require('./db/database.js');
const cols = db.prepare('PRAGMA table_info(users)').all();
console.log(cols.map(c => c.name));
