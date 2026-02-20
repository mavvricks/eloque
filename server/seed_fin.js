const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

console.log("Seeding Finance Module Data...");

const seed = async () => {
    try {
        // 1. Create Finance User
        const username = 'fin';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'Finance';

        const userStmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const existingUser = userStmt.get(username);

        if (!existingUser) {
            const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
            insertUser.run(username, hashedPassword, role);
            console.log(`User '${username}' created.`);
        } else {
            console.log(`User '${username}' already exists.`);
        }

        // 2. Mock Payments
        // Get some booking IDs to attach payments to
        const bookings = db.prepare('SELECT id FROM bookings LIMIT 5').all();

        if (bookings.length === 0) {
            console.log("No bookings found to attach payments to. Skipping mock payments.");
            return;
        }

        const insertPayment = db.prepare(`
            INSERT INTO payments (booking_id, amount, payment_method, proof_image, status, payment_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        // Mock Data
        const paymentsData = [
            { booking_id: bookings[0].id, amount: 5000, method: 'GCash', proof: 'https://placehold.co/400x600?text=Receipt+1', status: 'Pending', date: '2026-02-18 10:00:00' },
            { booking_id: bookings[0].id, amount: 15000, method: 'Bank Transfer', proof: 'https://placehold.co/400x600?text=Receipt+2', status: 'Verified', date: '2026-02-15 14:30:00' },
            { booking_id: bookings.length > 1 ? bookings[1].id : bookings[0].id, amount: 3500, method: 'Cash', proof: null, status: 'Pending', date: '2026-02-20 09:15:00' },
        ];

        for (const p of paymentsData) {
            // Check if payment already exists (simple check by date and amount to avoid duplicates on re-run)
            const check = db.prepare('SELECT * FROM payments WHERE booking_id = ? AND amount = ? AND payment_date = ?').get(p.booking_id, p.amount, p.date);
            if (!check) {
                insertPayment.run(p.booking_id, p.amount, p.method, p.proof, p.status, p.date);
                console.log(`Mock payment of ${p.amount} added.`);
            }
        }

        console.log("Finance data seeding complete.");

    } catch (error) {
        console.error("Seeding failed:", error);
    }
};

seed();
