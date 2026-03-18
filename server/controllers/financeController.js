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
                   b.transport_fee, b.labor_surcharge,
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

// Update payment term (amount, due_date)
exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, due_date } = req.body;

        if (amount === undefined || !due_date) {
            return res.status(400).json({ error: "Amount and due_date are required" });
        }

        const stmt = db.prepare('UPDATE payments SET amount = ?, due_date = ? WHERE id = ?');
        const info = stmt.run(amount, due_date, id);

        if (info.changes === 0) {
            return res.status(404).json({ error: "Payment not found" });
        }

        res.json({ success: true, message: "Payment updated successfully" });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: "Failed to update payment" });
    }
};

// Get transaction ledger (all payments with filters)
exports.getLedger = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = `
            SELECT p.*, b.event_date, b.client_full_name, b.package_id, u.username
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

// Send a payment reminder
exports.remindClient = async (req, res) => {
    try {
        const { paymentId } = req.params;

        // Simulating the email/SMS reminder logic
        const stmt = db.prepare('SELECT p.*, b.client_email, b.client_phone FROM payments p JOIN bookings b ON p.booking_id = b.id WHERE p.id = ?');
        const paymentInfo = stmt.get(paymentId);

        if (!paymentInfo) {
            return res.status(404).json({ error: "Payment not found" });
        }

        console.log(`[SIMULATED NOTIFICATION] Reminder sent to ${paymentInfo.client_email} for payment #${paymentId} due on ${paymentInfo.due_date}`);

        res.json({ success: true, message: "Reminder sent successfully" });
    } catch (error) {
        console.error("Error sending reminder:", error);
        res.status(500).json({ error: "Failed to send reminder" });
    }
};

// Get Refund Queue (Cancelled bookings with Verified payments)
exports.getRefundQueue = async (req, res) => {
    try {
        const query = `
            SELECT b.id as booking_id, b.client_full_name, b.client_email, b.event_date, b.total_cost,
                   SUM(p.amount) as total_paid
            FROM bookings b
            JOIN payments p ON b.id = p.booking_id
            WHERE b.status = 'Cancelled' AND p.status = 'Verified'
            GROUP BY b.id
        `;
        const items = db.prepare(query).all();
        res.json(items);
    } catch (error) {
        console.error("Error fetching refund queue:", error);
        res.status(500).json({ error: "Failed to fetch refund queue" });
    }
};

// Process Refund for a Booking
exports.processRefund = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const verifiedBy = req.user?.username || 'finance';

        // Update all verified payments for this booking to 'Refunded'
        const stmt = db.prepare("UPDATE payments SET status = 'Refunded', verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE booking_id = ? AND status = 'Verified'");
        const info = stmt.run(verifiedBy, bookingId);

        if (info.changes === 0) {
            return res.status(404).json({ error: "No verified payments found for this booking to refund." });
        }

        console.log(`[SIMULATED REFUND] Processed refund for booking #${bookingId}. Updated ${info.changes} payment records.`);

        res.json({ success: true, message: "Refund processed successfully." });
    } catch (error) {
        console.error("Error processing refund:", error);
        res.status(500).json({ error: "Failed to process refund" });
    }
};
