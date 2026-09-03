const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite Database
const db = new sqlite3.Database('./payroll.db', (err) => {
    if (err) console.error('Database opening error: ', err.message);
    else console.log('Connected to the SQLite database.');
});

// Create Table and Insert Sample Data if empty
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        employee_id TEXT UNIQUE,
        position TEXT,
        hours REAL,
        rate REAL
    )`, () => {
        db.get(`SELECT COUNT(*) as count FROM employees`, (err, row) => {
            if (row.count === 0) {
                const initialData = [
                    ["Alex Johnson", "ID-100123", "Manager", 160, 30.00],
                    ["Emily Davis", "ID-100124", "Sales Associate", 140, 15.00],
                    ["Brian Smith", "ID-100125", "Accountant", 160, 25.00],
                    ["Jessica White", "ID-100126", "Administrative Assistant", 150, 12.00],
                    ["Ryan Turner", "ID-100127", "IT Specialist", 168, 28.00]
                ];
                const stmt = db.prepare(`INSERT INTO employees (name, employee_id, position, hours, rate) VALUES (?, ?, ?, ?, ?)`);
                initialData.forEach(emp => stmt.run(emp));
                stmt.finalize();
                console.log('Initial sample records added to database.');
            }
        });
    });
});

// API Routes
app.get('/api/employees', (req, res) => {
    db.all(`SELECT * FROM employees`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/employees', (req, res) => {
    const { name, employee_id, position, hours, rate } = req.body;
    const query = `INSERT INTO employees (name, employee_id, position, hours, rate) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [name, employee_id, position, hours, rate], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, success: true });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});