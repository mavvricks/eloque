-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT CHECK( role IN ('SuperAdmin', 'Admin', 'Operations', 'Client', 'Finance') ) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data (if not exists)
-- Passwords should be hashed in production. 
-- For this setup script, we will insert them via the Node.js setup script to ensure hashing.
-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    pax INTEGER NOT NULL,
    budget INTEGER,
    package_id TEXT,
    client_full_name TEXT,
    venue_address_line TEXT,
    venue_street TEXT,
    venue_city TEXT,
    venue_province TEXT,
    venue_zip_code TEXT,
    client_email TEXT,
    client_phone TEXT,
    reservation_time TEXT,
    serving_time TEXT,
    event_timeline TEXT,
    color_motif TEXT,
    food_tasting_id INTEGER,
    total_cost DECIMAL(10, 2),
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Food Tastings Table
CREATE TABLE IF NOT EXISTS food_tastings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    proof_image TEXT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Pending',
    payment_type TEXT CHECK(payment_type IN ('Reservation','DownPayment','Final')),
    due_date DATE,
    verified_by TEXT,
    verified_at DATETIME,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
