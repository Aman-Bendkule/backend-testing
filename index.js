const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Configuration
const url = process.env.DB_URL;
const client = new MongoClient(url);
const dbName = 'Arohi_Travels';

client.connect()
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('MongoDB Connection Failed:', err));

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET; 

// Utility: Get Database Instance
const getDb = () => client.db(dbName);


const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = user;
        next();
    });
};

app.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    console.log(username,password);
    
    try {
        const db = getDb();
        const collection = db.collection('Admin');
        const admin = await collection.findOne({ username });
        console.log(admin);
        

        if (!admin) {
            return res.status(401).json({ message: 'Invalid Username or Password' });
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);

        console.log(isPasswordMatch);
        
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid Username or Password' });
        }

      
        const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/contact-data', authenticateToken, async (req, res) => {
    try {
        
        const db = getDb();
        const collection = db.collection('Customer');
        const data = await collection.find().toArray();

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching contact data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/enquiry-data', authenticateToken, async (req, res) => {
    try {
        const db = getDb();
        const collection = db.collection('inTouch');
        const data = await collection.find().toArray();

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching enquiry data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.post('/submitData', async (req, res) => {
    const customerData = req.body;

    try {
        const db = getDb();
        const collection = db.collection('Customer');
        await collection.insertOne(customerData);

        return res.status(200).json({ message: 'We will contact you soon...' });
    } catch (error) {
        console.error('Error submitting customer data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Submit Enquiry Data
app.post('/inTouchData', async (req, res) => {
    const inTouchData = req.body;

    try {
        const db = getDb();
        const collection = db.collection('inTouch');
        await collection.insertOne(inTouchData);

        return res.status(200).json({ message: 'We will contact you soon...' });
    } catch (error) {
        console.error('Error submitting enquiry data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
