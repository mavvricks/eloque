const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

console.log('Starting payment schedule migration...');

// 1. Add total_cost column to bookings if not exists
try {
    db.exec("ALTER TABLE bookings ADD COLUMN total_cost DECIMAL(10, 2)");
    console.log('Added total_cost column to bookings.');
} catch (e) {
    if (e.message.includes('duplicate column')) {
        console.log('total_cost column already exists, skipping.');
    } else {
        throw e;
    }
}

// 2. Add new columns to payments table if not exists
const columnsToAdd = [
    { name: 'payment_type', def: "TEXT CHECK(payment_type IN ('Reservation','DownPayment','Final'))" },
    { name: 'due_date', def: 'DATE' },
    { name: 'verified_by', def: 'TEXT' },
    { name: 'verified_at', def: 'DATETIME' },
];

for (const col of columnsToAdd) {
    try {
        db.exec(`ALTER TABLE payments ADD COLUMN ${col.name} ${col.def}`);
        console.log(`Added ${col.name} column to payments.`);
    } catch (e) {
        if (e.message.includes('duplicate column')) {
            console.log(`${col.name} column already exists, skipping.`);
        } else {
            throw e;
        }
    }
}

// 3. Backfill: generate payment schedule rows for existing bookings that don't have them
const bookings = db.prepare(`
    SELECT b.id, b.budget, b.total_cost, b.event_date
    FROM bookings b
    WHERE b.status != 'Cancelled'
`).all();

const existingPayments = db.prepare(`
    SELECT booking_id, payment_type FROM payments WHERE payment_type IS NOT NULL
`).all();

const existingSet = new Set(existingPayments.map(p => `${p.booking_id}-${p.payment_type}`));

const insertPayment = db.prepare(`
    INSERT INTO payments (booking_id, amount, payment_method, payment_date, status, payment_type, due_date)
    VALUES (?, ?, 'Pending', CURRENT_TIMESTAMP, 'Pending', ?, ?)
`);

let created = 0;
for (const booking of bookings) {
    const totalCost = booking.total_cost || booking.budget || 0;
    if (totalCost === 0) continue;

    // Update total_cost if not set
    if (!booking.total_cost && booking.budget) {
        db.prepare('UPDATE bookings SET total_cost = ? WHERE id = ?').run(booking.budget, booking.id);
    }

    const eventDate = new Date(booking.event_date);

    // Compute due dates
    const reservationDue = new Date(); // Due now
    const downPaymentDue = new Date(eventDate);
    downPaymentDue.setMonth(downPaymentDue.getMonth() - 1);
    const finalDue = new Date(eventDate);
    finalDue.setDate(finalDue.getDate() - 10);

    const schedule = [
        { type: 'Reservation', pct: 0.10, due: reservationDue.toISOString().split('T')[0] },
        { type: 'DownPayment', pct: 0.70, due: downPaymentDue.toISOString().split('T')[0] },
        { type: 'Final', pct: 0.20, due: finalDue.toISOString().split('T')[0] },
    ];

    for (const s of schedule) {
        const key = `${booking.id}-${s.type}`;
        if (!existingSet.has(key)) {
            const amount = Math.round(totalCost * s.pct * 100) / 100;
            insertPayment.run(booking.id, amount, s.type, s.due);
            created++;
        }
    }
}

console.log(`Created ${created} payment schedule rows for ${bookings.length} bookings.`);
console.log('Migration complete!');
db.close();
