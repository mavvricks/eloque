require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.js');
const bookingRoutes = require('./routes/bookings.js');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// New Routes
const bookingController = require('./controllers/bookingController');
const foodTastingController = require('./controllers/foodTastingController');
const clientDashboardController = require('./controllers/clientDashboardController');
const opsController = require('./controllers/opsController');
const financeController = require('./controllers/financeController');
const authenticateToken = require('./middleware/auth');

// Event Details update (from dashboard)
app.put('/api/bookings/:id/event-details', authenticateToken, bookingController.updateEventDetails);

// Cancel / Edit booking (7-day rule)
app.put('/api/bookings/:id/cancel', authenticateToken, bookingController.cancelBooking);
app.put('/api/bookings/:id/update', authenticateToken, bookingController.updateBooking);

// Client payment submission
app.post('/api/bookings/pay', authenticateToken, bookingController.recordPayment);



// Food Tasting Routes
const optionalAuthenticateToken = require('./middleware/optionalAuth');
app.post('/api/food-tasting', optionalAuthenticateToken, foodTastingController.createTasting); // Public (for guests) or Authenticated
app.get('/api/food-tasting', authenticateToken, foodTastingController.getMyTastings); // Protected

// Dashboard Routes
app.get('/api/dashboard/client', authenticateToken, clientDashboardController.getDashboardData); // Protected

// Ops Routes
app.get('/api/ops/bookings', authenticateToken, opsController.getAllBookings);
app.put('/api/ops/bookings/:id/status', authenticateToken, opsController.updateBookingStatus);
app.get('/api/ops/bookings/:id', authenticateToken, opsController.getBookingDetails);

// Finance Routes
app.get('/api/finance/bookings', authenticateToken, financeController.getBookingsWithPayments);
app.get('/api/finance/payments/pending', authenticateToken, financeController.getPendingPayments);
app.put('/api/finance/payments/:id/verify', authenticateToken, financeController.verifyPayment);
app.get('/api/finance/ledger', authenticateToken, financeController.getLedger);



app.get('/', (req, res) => {
    res.json({ message: "Eloquente Catering API is running" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
