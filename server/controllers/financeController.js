const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.sqlite');
const db = new Database(dbPath);

// Get all bookings with their payment schedules (for finance dashboard)
exports.getBookingsWithPayments = async (req, res) => {
    try {
        // Get all non-cancelled bookings
        const bookings = db.prepare(`
            SELECT b.id, b.event_date, b.event_time, b.pax, b.budget, b.total_cost,
                   b.client_full_name, b.client_email, b.client_phone, b.status,
                   u.username
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            WHERE b.status != 'Cancelled'
            ORDER BY b.event_date ASC
        `).all();

        // Get all payments
        const payments = db.prepare(`
            SELECT p.id, p.booking_id, p.amount, p.payment_method, p.proof_image,
                   p.payment_date, p.status, p.payment_type, p.due_date,
                   p.verified_by, p.verified_at
            FROM payments p
            WHERE p.payment_type IS NOT NULL
            ORDER BY
                CASE p.payment_type
                    WHEN 'Reservation' THEN 1
                    WHEN 'DownPayment' THEN 2
                    WHEN 'Final' THEN 3
                END
        `).all();

        // Group payments by booking_id
        const paymentsByBooking = {};
        for (const p of payments) {
            if (!paymentsByBooking[p.booking_id]) {
                paymentsByBooking[p.booking_id] = [];
            }
            paymentsByBooking[p.booking_id].push(p);
        }

        // Merge
        const result = bookings.map(b => ({
            ...b,
            totalCost: b.total_cost || b.budget || 0,
            payments: paymentsByBooking[b.id] || []
        }));

        res.json(result);
    } catch (error) {
        console.error("Error fetching bookings with payments:", error);
        res.status(500).json({ error: "Failed to fetch bookings with payments" });
    }
};

// Get pending payments for verification queue
exports.getPendingPayments = async (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT p.*, b.event_date, b.client_full_name, u.username
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE p.status = 'Pending'
            ORDER BY p.due_date ASC
        `);
        const payments = stmt.all();
        res.json(payments);
    } catch (error) {
        console.error("Error fetching pending payments:", error);
        res.status(500).json({ error: "Failed to fetch pending payments" });
    }
};

// Verify or reject a payment
exports.verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'Verify' or 'Reject'

        if (!['Verify', 'Reject'].includes(action)) {
            return res.status(400).json({ error: "Invalid action" });
        }

        const newStatus = action === 'Verify' ? 'Verified' : 'Rejected';
        const verifiedBy = req.user?.username || 'finance';

        const stmt = db.prepare('UPDATE payments SET status = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?');
        const info = stmt.run(newStatus, verifiedBy, id);

        if (info.changes === 0) {
            return res.status(404).json({ error: "Payment not found" });
        }

        res.json({ success: true, message: `Payment ${newStatus}` });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
};

// Get transaction ledger (all payments with filters)
exports.getLedger = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = `
            SELECT p.*, b.event_date, b.client_full_name, u.username
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'All') {
            query += " AND p.status = ?";
            params.push(status);
        }

        if (startDate) {
            query += " AND p.payment_date >= ?";
            params.push(startDate);
        }

        if (endDate) {
            query += " AND p.payment_date <= ?";
            params.push(endDate);
        }

        query += " ORDER BY p.payment_date DESC";

        const stmt = db.prepare(query);
        const payments = stmt.all(...params);
        res.json(payments);
    } catch (error) {
        console.error("Error fetching ledger:", error);
        res.status(500).json({ error: "Failed to fetch ledger" });
    }
};
