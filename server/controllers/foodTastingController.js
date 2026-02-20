const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new Database(dbPath);

exports.createTasting = async (req, res) => {
    try {
        const { guest_name, guest_email, guest_phone, preferred_date, preferred_time, notes } = req.body;
        const user_id = req.user ? req.user.user_id : null;

        const stmt = db.prepare(`
            INSERT INTO food_tastings (user_id, guest_name, guest_email, guest_phone, preferred_date, preferred_time, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        // If user is logged in, we might want to pre-fill or use their data, but for now we trust the body or null
        // If guest, user_id is null.

        const result = stmt.run(user_id, guest_name, guest_email, guest_phone, preferred_date, preferred_time, notes);

        res.status(201).json({ success: true, message: "Food tasting scheduled successfully!", tastingId: result.lastInsertRowid });
    } catch (error) {
        console.error("Error creating food tasting:", error);
        res.status(500).json({ success: false, message: "Failed to schedule food tasting." });
    }
};

exports.getMyTastings = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const stmt = db.prepare('SELECT * FROM food_tastings WHERE user_id = ? ORDER BY created_at DESC');
        const tastings = stmt.all(user_id);
        res.json(tastings);
    } catch (error) {
        console.error("Error fetching tastings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch tastings" });
    }
};
