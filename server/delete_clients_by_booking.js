const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new Database(dbPath);

const targetNames = [
    'darebpugi',
    'maverick aquino',
    'darev pugi'
];

try {
    console.log("Starting booking deletion process for target clients...");

    const bookings = db.prepare(`
        SELECT id, client_full_name, user_id 
        FROM bookings 
        WHERE LOWER(client_full_name) IN (?, ?, ?)
    `).all(
        ...targetNames.map(n => n.toLowerCase())
    );

    if (bookings.length === 0) {
        console.log("No matching bookings found.");
    } else {
        console.log(`Found ${bookings.length} bookings to delete:`, bookings);

        db.transaction(() => {
            for (const booking of bookings) {
                console.log(`\nDeleting data for booking #${booking.id} (Client: ${booking.client_full_name})`);

                // 1. Delete payments for this booking
                const delPayments = db.prepare('DELETE FROM payments WHERE booking_id = ?').run(booking.id);
                console.log(`  Deleted ${delPayments.changes} payments.`);

                // 2. Delete the booking
                const delBooking = db.prepare('DELETE FROM bookings WHERE id = ?').run(booking.id);
                console.log(`  Deleted booking record.`);

                // Optional: We can also delete the user if they were made just for this, but user_id 4 is 'client', user_id 26 is 'babyoleg', 32 is 'deanrev'.
                // If the user wants the "clients" deleted, deleting the bookings removes them from the ledger and dashboard.
            }
        })();

        console.log("\nDeletion process completed successfully.");
    }
} catch (error) {
    console.error("Error during deletion:", error);
} finally {
    db.close();
}
