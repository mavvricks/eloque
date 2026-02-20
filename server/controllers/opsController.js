const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.sqlite');
const db = new Database(dbPath);

exports.getAllBookings = async (req, res) => {
    try {
        // Fetch all bookings with user details
        const stmt = db.prepare(`
            SELECT b.*, u.username, u.role
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            ORDER BY b.event_date ASC
        `);
        const bookings = stmt.all();
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const stmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
        const info = stmt.run(status, id);

        if (info.changes === 0) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json({ success: true, message: "Booking status updated" });
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ error: "Failed to update booking status" });
    }
};

exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const stmt = db.prepare(`
            SELECT b.*, u.username, u.role, u.id as user_id
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.id = ?
        `);
        const booking = stmt.get(id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json(booking);
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({ error: "Failed to fetch booking details" });
    }
};
