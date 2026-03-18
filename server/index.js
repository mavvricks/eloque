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
const adminController = require('./controllers/adminController');
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
app.put('/api/ops/bookings/:id/livestatus', authenticateToken, opsController.updateBookingLiveStatus);
app.get('/api/ops/bookings/:id', authenticateToken, opsController.getBookingDetails);

// Finance Routes
app.get('/api/finance/bookings', authenticateToken, financeController.getBookingsWithPayments);
app.get('/api/finance/payments/pending', authenticateToken, financeController.getPendingPayments);
app.put('/api/finance/payments/:id/verify', authenticateToken, financeController.verifyPayment);
app.put('/api/finance/payments/:id', authenticateToken, financeController.updatePayment);
app.get('/api/finance/ledger', authenticateToken, financeController.getLedger);
app.post('/api/finance/remind/:paymentId', authenticateToken, financeController.remindClient);
app.get('/api/finance/refunds/queue', authenticateToken, financeController.getRefundQueue);
app.post('/api/finance/refund/:bookingId', authenticateToken, financeController.processRefund);

// Admin Routes
app.get('/api/admin/employees', authenticateToken, adminController.getEmployees);
app.post('/api/admin/employees', authenticateToken, adminController.createEmployee);
app.put('/api/admin/employees/:id', authenticateToken, adminController.updateEmployee);
app.delete('/api/admin/employees/:id', authenticateToken, adminController.deleteEmployee);

app.get('/api/pricing', adminController.getPricingOverrides); // public or auth
app.post('/api/admin/pricing', authenticateToken, adminController.updatePricingOverride);

app.post('/api/admin/bookings/:id/discount', authenticateToken, adminController.applyDiscount);

app.get('/api/admin/analytics', authenticateToken, adminController.getAnalytics);

// File Uploads
const multer = require('multer');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Add timestamp to prevent name collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the relative URL path to access the file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: "Eloquente Catering API is running" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
