const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../db/database.sqlite');
const db = new Database(dbPath);
// ==========================================
// 1. Employee Account Management (RBAC)
// ==========================================

exports.getEmployees = async (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT id, username, email, phone, role, created_at
            FROM users 
            WHERE role IN ('Marketing', 'Accounting')
            ORDER BY created_at DESC
        `);
        const employees = stmt.all();
        res.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const { username, password, email, phone, role } = req.body;

        if (!['Marketing', 'Accounting'].includes(role)) {
            return res.status(400).json({ error: "Invalid role specified" });
        }

        // Check if username exists
        const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?');
        const userExists = checkStmt.get(username);

        if (userExists) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertStmt = db.prepare(`
            INSERT INTO users (username, password, email, phone, role) 
            VALUES (?, ?, ?, ?, ?)
        `);

        const info = insertStmt.run(username, hashedPassword, email || null, phone || null, role);
        res.status(201).json({ id: info.lastInsertRowid, message: "Employee account created" });

    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ error: "Failed to create employee" });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, email, phone, role } = req.body;

        if (role && !['Marketing', 'Accounting'].includes(role)) {
            return res.status(400).json({ error: "Invalid role specified" });
        }

        // Ensure we don't accidentally update a Superadmin or Client via this endpoint
        const checkRoleStmt = db.prepare('SELECT role FROM users WHERE id = ?');
        const existingUser = checkRoleStmt.get(id);

        if (!existingUser || ['Superadmin', 'Client'].includes(existingUser.role)) {
            return res.status(403).json({ error: "Cannot modify this user" });
        }

        let updates = [];
        let params = [];

        if (username) { updates.push("username = ?"); params.push(username); }
        if (email !== undefined) { updates.push("email = ?"); params.push(email); }
        if (phone !== undefined) { updates.push("phone = ?"); params.push(phone); }
        if (role) { updates.push("role = ?"); params.push(role); }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push("password = ?");
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        params.push(id);

        const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
        stmt.run(...params);

        res.json({ message: "Employee account updated successfully" });

    } catch (error) {
        console.error("Error updating employee:", error);
        // Handle unique constraint failure for username
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: "Username is already taken" });
        }
        res.status(500).json({ error: "Failed to update employee" });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const checkRoleStmt = db.prepare('SELECT role FROM users WHERE id = ?');
        const existingUser = checkRoleStmt.get(id);

        if (!existingUser || ['Superadmin', 'Client'].includes(existingUser.role)) {
            return res.status(403).json({ error: "Cannot delete this user" });
        }

        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        stmt.run(id);

        res.json({ message: "Employee account deleted successfully" });
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ error: "Failed to delete employee" });
    }
};

// ==========================================
// 2. Global Pricing Control
// ==========================================

exports.getPricingOverrides = async (req, res) => {
    try {
        const overrides = db.prepare('SELECT * FROM pricing_overrides').all();
        // Convert array to a more usable object keyed by ID
        const pricingMap = {};
        for (const item of overrides) {
            pricingMap[item.id] = item.new_price;
        }
        res.json({ overrides: pricingMap });
    } catch (error) {
        console.error("Error fetching pricing overrides:", error);
        res.status(500).json({ error: "Failed to fetch pricing overrides" });
    }
};

exports.updatePricingOverride = async (req, res) => {
    try {
        const { id, item_type, item_id, new_price } = req.body;

        const stmt = db.prepare(`
            INSERT INTO pricing_overrides (id, item_type, item_id, new_price)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET new_price = excluded.new_price, updated_at = CURRENT_TIMESTAMP
        `);

        stmt.run(id, item_type, item_id, new_price);
        res.json({ message: "Pricing updated successfully" });

    } catch (error) {
        console.error("Error updating pricing override:", error);
        res.status(500).json({ error: "Failed to update pricing" });
    }
};

// ==========================================
// 3. Custom On-The-Fly Discounts
// ==========================================

exports.applyDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const { discount_value, discount_type } = req.body; // type: 'fixed' or 'percentage'

        // Get the booking
        const booking = db.prepare('SELECT budget, total_cost FROM bookings WHERE id = ?').get(id);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        // Calculate base cost before discount (assuming total_cost is the true value we want to discount from, or budget)
        // Since total_cost gets updated by discount, let's look at how much we should discount.
        // For simplicity, total_cost here acts as the "final amount". We need the original amount first.
        // In the original booking logic, total_cost is generated from the budget or package selection.
        // It's safer to read the original amount from 'budget' (which acts as the base contract amount) or just subtract from total_cost.

        // As a simpler approach, we'll just store the discount columns, and the frontend will display the reduction. 
        // We'll update total_cost by subtracting the discount from the "budget" (which represents the original total cost).

        let original_amount = booking.budget || booking.total_cost || 0;
        let new_total_cost = original_amount;

        if (discount_type === 'percentage') {
            const deduction = original_amount * (discount_value / 100);
            new_total_cost = original_amount - deduction;
        } else if (discount_type === 'fixed') {
            new_total_cost = original_amount - discount_value;
        } else {
            // Remove discount
            new_total_cost = original_amount;
        }

        // Ensure cost doesn't go below 0
        new_total_cost = Math.max(0, new_total_cost);

        db.prepare(`
            UPDATE bookings 
            SET discount_value = ?, discount_type = ?, total_cost = ? 
            WHERE id = ?
        `).run(discount_value || 0, discount_type || 'fixed', new_total_cost, id);

        // Also we must adjust payments appropriately if we want tracking, but for now just updating the booking is fine.
        // To properly handle payments, accounting will need to recalculate them.

        res.json({ message: "Discount applied successfully", new_total_cost });
    } catch (error) {
        console.error("Error applying discount:", error);
        res.status(500).json({ error: "Failed to apply discount" });
    }
};

// ==========================================
// 4. Decision Support System (DSS): Analytics
// ==========================================

exports.getAnalytics = async (req, res) => {
    try {
        // Revenue Trends: SUM(total_cost) of completed bookings, grouped by month.
        // Assume 'Completed' status means it's done. 
        // Note: SQLite strftime('%Y-%m') groups by year-month.
        const revenueTrends = db.prepare(`
            SELECT strftime('%Y-%m', event_date) as month, SUM(total_cost) as revenue
            FROM bookings
            WHERE status = 'Completed' OR status = 'Approved' OR status = 'Pending' -- include all active for projection
            GROUP BY month
            ORDER BY month ASC
        `).all();

        // Market Intelligence (Top Sellers): COUNT(package_id) across all events
        const topSellers = db.prepare(`
            SELECT package_id, COUNT(id) as count
            FROM bookings
            WHERE package_id IS NOT NULL AND status != 'Cancelled'
            GROUP BY package_id
            ORDER BY count DESC
        `).all();

        // Peak Season Heatmaps: COUNT(event_date) grouped by calendar month
        const peakSeasons = db.prepare(`
            SELECT strftime('%m', event_date) as month, COUNT(id) as count
            FROM bookings
            WHERE status != 'Cancelled'
            GROUP BY month
            ORDER BY count DESC
        `).all();

        res.json({
            revenueTrends,
            topSellers,
            peakSeasons
        });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};
