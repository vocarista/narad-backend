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

// Register User
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);


    const found = await pool.query('SELECT * FROM users WHERE email = $1', [email]) 
    if(found.rows) {
        return res.status(403).send('User already exists')
    }
    // Insert the new user into the database
    await pool.query(
      'INSERT INTO users (email, name, password, phone_number) VALUES ($1, $2, $3, $4)',
      [email, name, hashedPassword, phone]
    );

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    // Generate a JWT token
    const token = jwt.sign({ username: email }, process.env.JWT_SECRET, { expiresIn: '3600h' });
    res.json({ token: token, user: {
        id: result.rows[0].id,
        email: email,
        name: name,
        phone: phone,
    } });
  } catch (error) {
    console.error('Error in registration:', error);
    // Handle specific errors here (e.g., database errors)
    res.status(500).send('Server error during registration');
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Query the database for the user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Compare the password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid password');
    }
    // Generate a JWT token
    const token = jwt.sign({ username: email }, process.env.JWT_SECRET, { expiresIn: '3600h' });
    res.json({ token: token, user: {
        id: user.id,
        email: email,
        name: user.name,
        phone: user.phone_number,
    } });
  } catch (error) {
    console.error('Error in login:', error);
    // Handle specific errors here (e.g., database errors)
    res.status(500).send('Server error during login');
  }
};

const verifyToken = (req, res) => {
    res.status(200).json({ message: 'Token is valid', user: req.user });
  };


module.exports = {
  register,
  login,
  verifyToken
};