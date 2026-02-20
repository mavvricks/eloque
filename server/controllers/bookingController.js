const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.sqlite');
const db = new Database(dbPath);

// Disable FK enforcement - bookings table has a stale FK referencing 'users_old' instead of 'users'
db.pragma('foreign_keys = OFF');

// Configuration
const MAX_PAX_PER_DAY = 3500;
const MAX_EVENTS_PER_DAY = 10;

// Create a new booking
const createBooking = (req, res) => {
    try {
        const {
            user_id, event_date, event_time, pax, budget, package_id,
            client_full_name, venue_address_line, venue_street, venue_city, venue_province, venue_zip_code,
            client_email, client_phone, total_cost
        } = req.body;
        console.log("Creating booking:", req.body);

        if (!user_id || !event_date || !event_time || !pax) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // 1. Check Event Limit
        const eventCountStmt = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE event_date = ? AND status != 'Cancelled'");
        const eventCount = eventCountStmt.get(event_date).count;

        if (eventCount >= MAX_EVENTS_PER_DAY) {
            return res.status(400).json({ error: "Booking unavailable: Maximum events for this date reached." });
        }

        // 2. Check Pax Limit
        const paxSumStmt = db.prepare("SELECT SUM(pax) as totalPax FROM bookings WHERE event_date = ? AND status != 'Cancelled'");
        const paxSumResult = paxSumStmt.get(event_date);
        const currentTotalPax = paxSumResult.totalPax || 0;

        if (currentTotalPax + parseInt(pax) > MAX_PAX_PER_DAY) {
            return res.status(400).json({
                error: `Booking unavailable: Exceeds daily capacity. Remaining capacity: ${MAX_PAX_PER_DAY - currentTotalPax} pax.`
            });
        }

        // 3. Insert Booking
        const insertStmt = db.prepare(`
            INSERT INTO bookings (user_id, event_date, event_time, pax, budget, package_id,
                client_full_name, venue_address_line, venue_street, venue_city, venue_province, venue_zip_code,
                client_email, client_phone, total_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = insertStmt.run(
            user_id, event_date, event_time, pax, budget, package_id,
            client_full_name || null, venue_address_line || null, venue_street || null,
            venue_city || null, venue_province || null, venue_zip_code || null,
            client_email || null, client_phone || null, total_cost || budget || null
        );

        // Auto-generate 3-tier payment schedule
        const bookingId = Number(info.lastInsertRowid);
        const cost = parseFloat(total_cost) || parseFloat(budget) || 0;
        try {
            if (cost > 0) {
                const eventDateObj = new Date(event_date);
                const reservationDue = new Date().toISOString().split('T')[0];
                const downPaymentDue = new Date(eventDateObj);
                downPaymentDue.setMonth(downPaymentDue.getMonth() - 1);
                const finalDue = new Date(eventDateObj);
                finalDue.setDate(finalDue.getDate() - 10);

                const insertPayment = db.prepare(`
                    INSERT INTO payments (booking_id, amount, payment_method, payment_date, status, payment_type, due_date)
                    VALUES (?, ?, 'Pending', CURRENT_TIMESTAMP, 'Pending', ?, ?)
                `);

                insertPayment.run(bookingId, Math.round(cost * 0.10 * 100) / 100, 'Reservation', reservationDue);
                insertPayment.run(bookingId, Math.round(cost * 0.70 * 100) / 100, 'DownPayment', downPaymentDue.toISOString().split('T')[0]);
                insertPayment.run(bookingId, Math.round(cost * 0.20 * 100) / 100, 'Final', finalDue.toISOString().split('T')[0]);
                console.log(`Created 3 payment schedule rows for booking #${bookingId}`);
            }
        } catch (paymentError) {
            console.error("Payment schedule creation failed (booking still created):", paymentError);
        }

        res.status(201).json({ message: "Booking created successfully!", bookingId: bookingId });

    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({ error: `Failed to create booking: ${error.message}` });
    }
};

// Check Availability for a specific date
const checkAvailability = (req, res) => {
    try {
        const { date } = req.params;

        if (!date) {
            return res.status(400).json({ error: "Date parameter is required." });
        }

        const eventsStmt = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE event_date = ? AND status != 'Cancelled'");
        const eventCount = eventsStmt.get(date).count;

        const paxStmt = db.prepare("SELECT SUM(pax) as totalPax FROM bookings WHERE event_date = ? AND status != 'Cancelled'");
        const totalPax = paxStmt.get(date).totalPax || 0;

        const remainingPax = Math.max(0, MAX_PAX_PER_DAY - totalPax);
        const remainingEvents = Math.max(0, MAX_EVENTS_PER_DAY - eventCount);
        const isFull = remainingEvents === 0 || remainingPax === 0;

        res.json({
            date,
            isFull,
            remainingPax,
            remainingEvents,
            currentPax: totalPax,
            currentEvents: eventCount
        });

    } catch (error) {
        console.error("Check Availability Error:", error);
        res.status(500).json({ error: "Failed to check availability." });
    }
};

// Update event details from dashboard (reservation time, serving time, timeline, color motif)
const updateEventDetails = (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;
        const { reservation_time, serving_time, event_timeline, color_motif } = req.body;

        // Verify the booking belongs to this user
        const bookingStmt = db.prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ?");
        const booking = bookingStmt.get(id, user_id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        const updateStmt = db.prepare(`
            UPDATE bookings
            SET reservation_time = ?, serving_time = ?, event_timeline = ?, color_motif = ?
            WHERE id = ? AND user_id = ?
        `);

        updateStmt.run(
            reservation_time || null,
            serving_time || null,
            event_timeline || null,
            color_motif || null,
            id,
            user_id
        );

        res.json({ message: "Event details updated successfully!" });

    } catch (error) {
        console.error("Update Event Details Error:", error);
        res.status(500).json({ error: "Failed to update event details." });
    }
};

// Cancel a booking (only if 7+ days before event)
const cancelBooking = (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        const bookingStmt = db.prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ?");
        const booking = bookingStmt.get(id, user_id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ error: "Booking is already cancelled." });
        }

        // Check 7-day rule
        const eventDate = new Date(booking.event_date);
        const now = new Date();
        const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilEvent < 7) {
            return res.status(400).json({ error: "Cannot cancel within 7 days of the event date." });
        }

        const updateStmt = db.prepare("UPDATE bookings SET status = 'Cancelled' WHERE id = ? AND user_id = ?");
        updateStmt.run(id, user_id);

        res.json({ message: "Booking cancelled successfully." });

    } catch (error) {
        console.error("Cancel Booking Error:", error);
        res.status(500).json({ error: "Failed to cancel booking." });
    }
};

// Update booking details via modal (only if 7+ days before event)
const updateBooking = (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        const bookingStmt = db.prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ?");
        const booking = bookingStmt.get(id, user_id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ error: "Cannot edit a cancelled booking." });
        }

        // Check 7-day rule
        const eventDate = new Date(booking.event_date);
        const now = new Date();
        const daysUntilEvent = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilEvent < 7) {
            return res.status(400).json({ error: "Cannot edit within 7 days of the event date." });
        }

        const {
            event_date, event_time, pax,
            client_full_name, venue_address_line, venue_street,
            venue_city, venue_province, venue_zip_code,
            client_email, client_phone
        } = req.body;

        const updateStmt = db.prepare(`
            UPDATE bookings SET
                event_date = COALESCE(?, event_date),
                event_time = COALESCE(?, event_time),
                pax = COALESCE(?, pax),
                client_full_name = COALESCE(?, client_full_name),
                venue_address_line = COALESCE(?, venue_address_line),
                venue_street = COALESCE(?, venue_street),
                venue_city = COALESCE(?, venue_city),
                venue_province = COALESCE(?, venue_province),
                venue_zip_code = COALESCE(?, venue_zip_code),
                client_email = COALESCE(?, client_email),
                client_phone = COALESCE(?, client_phone)
            WHERE id = ? AND user_id = ?
        `);

        updateStmt.run(
            event_date || null, event_time || null, pax || null,
            client_full_name || null, venue_address_line || null, venue_street || null,
            venue_city || null, venue_province || null, venue_zip_code || null,
            client_email || null, client_phone || null,
            id, user_id
        );

        res.json({ message: "Booking updated successfully." });

    } catch (error) {
        console.error("Update Booking Error:", error);
        res.status(500).json({ error: "Failed to update booking." });
    }
};

// Record a payment (client submits payment)
const recordPayment = (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { payment_id, booking_id, amount, payment_method, reference_number, pay_in_full } = req.body;

        // Verify the booking belongs to this user
        const bookingStmt = db.prepare("SELECT * FROM bookings WHERE id = ? AND user_id = ?");
        const booking = bookingStmt.get(booking_id, user_id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found." });
        }

        if (pay_in_full) {
            // Update all pending payments for this booking
            const updateAll = db.prepare(
                "UPDATE payments SET payment_method = ?, status = 'Pending', payment_date = CURRENT_TIMESTAMP WHERE booking_id = ? AND status = 'Pending'"
            );
            updateAll.run(payment_method, booking_id);
        } else {
            // Update single payment
            const updateStmt = db.prepare(
                "UPDATE payments SET payment_method = ?, status = 'Pending', payment_date = CURRENT_TIMESTAMP WHERE id = ? AND booking_id = ?"
            );
            updateStmt.run(payment_method, payment_id, booking_id);
        }

        res.json({ message: "Payment recorded successfully. Pending verification." });

    } catch (error) {
        console.error("Record Payment Error:", error);
        res.status(500).json({ error: "Failed to record payment." });
    }
};

module.exports = {
    createBooking,
    checkAvailability,
    updateEventDetails,
    cancelBooking,
    updateBooking,
    recordPayment
};
