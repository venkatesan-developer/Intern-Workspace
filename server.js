const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the current directory

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root@12345',
    database: 'interndata'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Save user data with the current date and time
app.post('/save', (req, res) => {
    const { name, address, phone, date } = req.body;
    const query = 'INSERT INTO userdata (user_data) VALUES (JSON_OBJECT("name", ?, "address", ?, "phone", ?, "date", ?))';

    db.query(query, [name, address, phone, date], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'User saved!' });
    });
});

// View user data with date filtering
app.get('/view', (req, res) => {
    const { fromDate, toDate } = req.query;
    let query = 'SELECT id, JSON_EXTRACT(user_data, "$.name") as name, JSON_EXTRACT(user_data, "$.address") as address, JSON_EXTRACT(user_data, "$.phone") as phone, JSON_EXTRACT(user_data, "$.date") as date FROM userdata';
    let conditions = [];

    if (fromDate && toDate) {
        // Convert dates to the correct format
        conditions.push(`JSON_EXTRACT(user_data, "$.date") >= '${fromDate}T00:00:00.000Z' AND JSON_EXTRACT(user_data, "$.date") <= '${toDate}T23:59:59.999Z'`);
    }

    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
