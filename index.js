const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: '', // Replace with your MySQL password
    database: 'billing' // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Route to add billing data
app.post('/add-item', (req, res) => {
    const { item, quantity, price } = req.body;
    const total = quantity * price;
    
    const query = 'INSERT INTO bills (item, quantity, price, total) VALUES (?, ?, ?, ?)';
    db.query(query, [item, quantity, price, total], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('Database error');
        } else {
            res.status(200).send('Item added successfully');
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
