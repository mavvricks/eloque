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
    console.log("Starting client deletion process...");

    // Find users by username or full name (case insensitive)
    const users = db.prepare(`
        SELECT id, username, full_name 
        FROM users 
        WHERE LOWER(username) IN (?, ?, ?) 
           OR LOWER(full_name) IN (?, ?, ?)
    `).all(
        ...targetNames.map(n => n.toLowerCase()),
        ...targetNames.map(n => n.toLowerCase())
    );

    if (users.length === 0) {
        console.log("No matching users found.");
    } else {
        console.log("Found users to delete:", users);

        db.transaction(() => {
            for (const user of users) {
                console.log(`\nDeleting data for user: ${user.username || user.full_name} (ID: ${user.id})`);

                // 1. Get all bookings for the user
                const bookings = db.prepare('SELECT id FROM bookings WHERE user_id = ?').all(user.id);

                for (const booking of bookings) {
                    // Delete payments for each booking
                    const delPayments = db.prepare('DELETE FROM payments WHERE booking_id = ?').run(booking.id);
                    console.log(`  Deleted ${delPayments.changes} payments for booking #${booking.id}`);
                }

                // 2. Delete bookings
                const delBookings = db.prepare('DELETE FROM bookings WHERE user_id = ?').run(user.id);
                console.log(`  Deleted ${delBookings.changes} bookings.`);

                // 3. Delete food tastings
                const delTastings = db.prepare('DELETE FROM food_tastings WHERE user_id = ?').run(user.id);
                console.log(`  Deleted ${delTastings.changes} food tastings.`);

                // 4. Delete user
                const delUser = db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
                console.log(`  Deleted user record.`);
            }
        })();

        console.log("\nDeletion process completed successfully.");
    }
} catch (error) {
    console.error("Error during deletion:", error);
} finally {
    db.close();
}
