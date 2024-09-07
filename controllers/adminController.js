const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { Pool } = require('pg'); // Import Pool directly from pg
const { Connector } = require('@google-cloud/cloud-sql-connector'); // Import Connector directly

let pool; // Declare pool outside functions
let connector; // Declare connector outside functions

async function createPoolAndConnector() {
  connector = new Connector();
  clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.DB_INSTANCE_CONNECTION_NAME,
    ipTypes: ['PUBLIC'],
  });
  pool = new Pool({
    ...clientOpts,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

createPoolAndConnector(); // Call initialization function

const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Query the database for the user
        const result = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
        const user = result.rows[0];
    
        if (!user) {
        return res.status(400).send('Invalid credentials');
        }
        // Check if the password is correct
        if (await bcrypt.compare(password, user.password)) {
        // Generate a JWT token
        const token = jwt.sign({ username: email }, process.env.JWT_SECRET, { expiresIn: '3600h' });
        res.json({ token: token, user: {
            id: user.id,
            email: email,
            name: user.name,
            phone: user.phone,
        } });
        } else {
        res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send('Server error during login');
    }
}

module.exports = { adminLogin };