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

const getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        const users = result.rows;
        await pool.end();
        connector.close();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in getting users:', error);
        res.status(500).send('Server error during getting users');
    }
}

const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        await pool.end();
        connector.close();
        res.status(200).send('User deleted successfully');
    } catch (error) {
        console.error('Error in deleting user:', error);
        res.status(500).send('Server error during deleting user');
    }
}

module.exports = { getUsers, deleteUser };