const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from the root directory

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root@12345',
    database: 'interndata'
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Route for signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT COUNT(*) AS count FROM signup WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result[0].count > 0) return res.json({ success: false, message: 'Username already exists' });

        const insertQuery = 'INSERT INTO signup (username, password) VALUES (?, ?)';
        db.query(insertQuery, [username, password], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Route for login
app.get('/login', (req, res) => {
    const { username, password } = req.query;

    const query = 'SELECT * FROM signup WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.json({ success: false, message: 'not_signed_up' });
        if (result[0].password !== password) return res.json({ success: false, message: 'wrong_password' });

        res.json({ success: true });
    });
});

// Route to check phone number uniqueness
app.get('/checkPhone', (req, res) => {
    const { phone } = req.query;

    const query = 'SELECT COUNT(*) AS count FROM userdata WHERE JSON_UNQUOTE(JSON_EXTRACT(user_data, "$.phone")) = ?';
    db.query(query, [phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ exists: result[0].count > 0 });
    });
});

// Route to save user data
app.post('/save', (req, res) => {
    const { name, address, phone, date } = req.body;

    const query = 'INSERT INTO userdata (user_data) VALUES (JSON_OBJECT("name", ?, "address", ?, "phone", ?, "date", ?))';
    db.query(query, [name, address, phone, date], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User saved!' });
    });
});

// Route to view users
app.get('/view', (req, res) => {
    const query = 'SELECT * FROM userdata';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(row => ({
            id: row.id,
            ...JSON.parse(row.user_data)
        })));
    });
});

// Route to filter users
app.get('/filterUsers', (req, res) => {
    const { filter } = req.query;

    const query = 'SELECT * FROM userdata WHERE JSON_UNQUOTE(JSON_EXTRACT(user_data, "$.name")) LIKE ? OR JSON_UNQUOTE(JSON_EXTRACT(user_data, "$.phone")) LIKE ?';
    db.query(query, [`%${filter}%`, `%${filter}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(row => ({
            id: row.id,
            ...JSON.parse(row.user_data)
        })));
    });
});

// Route to get a user by id for editing
app.get('/getUser', (req, res) => {
    const { id } = req.query;

    const query = 'SELECT * FROM userdata WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(JSON.parse(result[0].user_data));
    });
});

// Route to update user
app.put('/updateUser', (req, res) => {
    const { id } = req.query;
    const { name, phone, address } = req.body;

    const query = 'UPDATE userdata SET user_data = JSON_OBJECT("name", ?, "address", ?, "phone", ?) WHERE id = ?';
    db.query(query, [name, address, phone, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Route to delete a user
app.delete('/deleteUser', (req, res) => {
    const { id } = req.query;

    const query = 'DELETE FROM userdata WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
