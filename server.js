const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from the root directory

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: 'root@12345', // Your MySQL password
    database: 'interndata' // Your database name
});

// Connect to the database
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Route to check for phone number duplication
app.get('/checkPhone', (req, res) => {
    const { phone } = req.query;

    const query = 'SELECT COUNT(*) AS count FROM userdata WHERE JSON_UNQUOTE(JSON_EXTRACT(user_data, "$.phone")) = ?';
    
    db.query(query, [phone], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ exists: result[0].count > 0 });
    });
});

// Route to save user data
app.post('/save', (req, res) => {
    const { name, address, phone, date } = req.body;

    const query = 'INSERT INTO userdata (user_data) VALUES (JSON_OBJECT("name", ?, "address", ?, "phone", ?, "date", ?))';
    
    db.query(query, [name, address, phone, date], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Trigger the webhook after saving data
        axios.post('https://webhook.site/126da263-950e-43bf-ad60-f2b8d9f3460f', { name, address, phone, date })
            .then(() => {
                console.log('Webhook triggered successfully');
                res.status(200).json({ message: 'User saved!' });
            })
            .catch((error) => {
                console.error('Error triggering webhook:', error);
                res.status(200).json({ message: 'User saved, but failed to trigger webhook.' });
            });
    });
});

// Route to view user data
app.get('/view', (req, res) => {
    const query = 'SELECT * FROM userdata';
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results.map(row => ({
            id: row.id,
            ...JSON.parse(row.user_data)
        })));
    });
});

// Trigger webhook for a specific user
app.get('/webhook/:id', (req, res) => {
    const userId = req.params.id;

    const query = 'SELECT user_data FROM userdata WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const userData = JSON.parse(result[0].user_data);

        axios.post('https://webhook.site/126da263-950e-43bf-ad60-f2b8d9f3460f', userData)
            .then(() => {
                res.json({ message: 'Webhook triggered successfully!' });
            })
            .catch((error) => {
                console.error('Error triggering webhook:', error);
                res.status(500).json({ error: 'Failed to trigger webhook.' });
            });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
