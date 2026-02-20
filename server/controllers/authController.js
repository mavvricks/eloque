const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.sqlite');
const db = new Database(dbPath);

const JWT_SECRET = process.env.JWT_SECRET || 'eloquente_secret_key';

// Register Logic (Optional for this milestone but good to have)
const register = async (req, res) => {
    try {
        const { username, password, role, email, phone } = req.body;

        if (!(username && password && role)) {
            return res.status(400).send("All input is required");
        }

        const oldUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const stmt = db.prepare('INSERT INTO users (username, password, role, email, phone) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(username, encryptedPassword, role, email || null, phone || null);

        const user = { id: info.lastInsertRowid, username, role };

        const token = jwt.sign(
            { user_id: user.id, username, role },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        user.token = token;
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};

// Login Logic
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!(username && password)) {
            return res.status(400).send("All input is required");
        }

        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user.id, username, role: user.role },
                JWT_SECRET,
                { expiresIn: "2h" }
            );

            // Return user details without password
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json({ ...userWithoutPassword, token });
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    register,
    login
};
