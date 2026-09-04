const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'employees.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (if your HTML/CSS/JS files are in the same folder or a 'public' folder)
app.use(express.static(__dirname));

// Helper functions to read/write employee data safely
function getEmployeesData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading data file:', err);
        return [];
    }
}

function saveEmployeesData(employees) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(employees, null, 2));
    } catch (err) {
        console.error('Error saving data file:', err);
    }
}

// ================= API ROUTES =================

// 1. GET all employees
app.get('/api/employees', (req, res) => {
    const employees = getEmployeesData();
    res.json(employees);
});

// 2. POST a new employee
app.post('/api/employees', (req, res) => {
    const employees = getEmployeesData();
    const newEmployee = {
        id: Date.now(), // Generate a unique numeric ID based on timestamp
        employee_id: req.body.employee_id || '',
        lastname: req.body.lastname || '',
        firstname: req.body.firstname || '',
        middlename: req.body.middlename || '',
        dob: req.body.dob || '',
        contact: req.body.contact || '',
        gov_id: req.body.gov_id || '',
        job_info: req.body.job_info || '',
        doe: req.body.doe || '',
        status: req.body.status || '',
        rate: parseFloat(req.body.rate) || 0
    };

    employees.push(newEmployee);
    saveEmployeesData(employees);
    res.status(201).json(newEmployee);
});

// 3. PUT (Update) an employee by ID
app.put('/api/employees/:id', (req, res) => {
    const employees = getEmployeesData();
    const employeeId = Number(req.params.id);
    const index = employees.findIndex(e => e.id === employeeId);

    if (index === -1) {
        return res.status(404).json({ error: 'Employee not found' });
    }

    employees[index] = {
        ...employees[index],
        employee_id: req.body.employee_id || employees[index].employee_id,
        lastname: req.body.lastname || employees[index].lastname,
        firstname: req.body.firstname || employees[index].firstname,
        middlename: req.body.middlename || employees[index].middlename,
        dob: req.body.dob || employees[index].dob,
        contact: req.body.contact || employees[index].contact,
        gov_id: req.body.gov_id || employees[index].gov_id,
        job_info: req.body.job_info || employees[index].job_info,
        doe: req.body.doe || employees[index].doe,
        status: req.body.status || employees[index].status,
        rate: req.body.rate !== undefined ? parseFloat(req.body.rate) : employees[index].rate
    };

    saveEmployeesData(employees);
    res.json(employees[index]);
});

// 4. DELETE an employee by ID
app.delete('/api/employees/:id', (req, res) => {
    let employees = getEmployeesData();
    const employeeId = Number(req.params.id);
    const initialLength = employees.length;

    employees = employees.filter(e => e.id !== employeeId);

    if (employees.length === initialLength) {
        return res.status(404).json({ error: 'Employee not found' });
    }

    saveEmployeesData(employees);
    res.json({ success: true, message: 'Employee deleted successfully' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Payroll server running at http://localhost:${PORT}`);
});