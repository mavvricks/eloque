const http = require('http');

function request(options, body) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    // Login as finance
    const loginRes = await request({
        hostname: 'localhost', port: 3000, path: '/api/auth/login',
        method: 'POST', headers: { 'Content-Type': 'application/json' }
    }, { username: 'fin', password: 'fin123' });

    console.log('Login:', loginRes.token ? 'OK' : 'FAILED');
    if (!loginRes.token) { console.log(loginRes); return; }

    // Fetch bookings with payments
    const bookings = await request({
        hostname: 'localhost', port: 3000, path: '/api/finance/bookings',
        method: 'GET', headers: { 'Authorization': 'Bearer ' + loginRes.token }
    });

    console.log(`\nBookings found: ${bookings.length}`);
    for (const b of bookings) {
        console.log(`\n--- Booking #${b.id}: ${b.client_full_name || b.username} ---`);
        console.log(`  Event: ${b.event_date} | Pax: ${b.pax} | Total Cost: ₱${b.totalCost}`);
        console.log(`  Payments (${b.payments.length}):`);
        for (const p of b.payments) {
            console.log(`    ${p.payment_type}: ₱${p.amount} | Due: ${p.due_date} | Status: ${p.status}`);
        }
    }
}

main().catch(console.error);
