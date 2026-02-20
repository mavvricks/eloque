const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const db = new Database(dbPath);

exports.getDashboardData = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        console.log("Fetching dashboard data for user_id:", user_id);

        // Fetch Bookings
        const bookingsStmt = db.prepare('SELECT * FROM bookings WHERE user_id = ? ORDER BY event_date DESC');
        const bookings = bookingsStmt.all(user_id);
        console.log(`Fetched bookings for user ${user_id}:`, bookings);

        // Fetch Tastings
        const tastingsStmt = db.prepare('SELECT * FROM food_tastings WHERE user_id = ? ORDER BY preferred_date DESC');
        const tastings = tastingsStmt.all(user_id);

        // Fetch Payments (For all user bookings)
        // This is a bit complex if payments are linked to bookings. 
        // We can join or just fetch all payments where booking.user_id = user_id
        const paymentsStmt = db.prepare(`
            SELECT p.id, p.booking_id, p.amount, p.payment_method, p.proof_image,
                   p.payment_date, p.status, p.payment_type, p.due_date,
                   p.verified_by, p.verified_at,
                   b.event_date, b.client_full_name, b.total_cost
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            WHERE b.user_id = ?
            ORDER BY p.booking_id, 
                CASE p.payment_type
                    WHEN 'Reservation' THEN 1
                    WHEN 'DownPayment' THEN 2
                    WHEN 'Final' THEN 3
                END
        `);
        const payments = paymentsStmt.all(user_id);

        res.json({
            bookings,
            tastings,
            payments
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
    }
};
