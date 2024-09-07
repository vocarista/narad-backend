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

const createAlert = async (req, res) => {
    const { user_id, alert } = req.body;
    try {
        const { title, description, severity, type, affectedArea, latitude, longitude } = alert;
        const result = await pool.query("INSERT INTO alerts (user_id, title, description, created_at, incident_severity, incident_type, affected_area, latitude, longitude) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8) RETURNING *", [user_id, title, description, severity, type, affectedArea, latitude, longitude]);
        const newAlert = result.rows[0];
        res.status(201).json(newAlert);
    } catch (error) {
        console.error('Error in creating alert:', error);
        res.status(500).send('Server error during creating alert');
    }
}

const deleteAlert = async (req, res) => {
    const report_id = req.params.id;
    try {
        await pool.query('DELETE FROM alerts WHERE id = $1', [report_id]);
        res.status(200).send('Alert deleted successfully');
    } catch (err) {
        console.error('Error in deleting alert', err);
        res.status(500).send('Server error during deleting alert')
    }
}

const getAlerts = async (req, res) => {
    const { latitude, longitude, radius } = req.query;
  
    try {
      let result;
      if (!latitude || !longitude || !radius) {
        // Fetch all reports if parameters are missing
        result = await pool.query('SELECT * FROM alerts');
      } else {
        // Fetch reports within a certain radius
        result = await pool.query(
          "SELECT * FROM alerts WHERE earth_box(ll_to_earth($1, $2), $3) @> ll_to_earth(latitude, longitude)",
          [latitude, longitude, radius]
        );
      }
  
      const alerts = result.rows;
      
      // Send the response with the fetched reports
      res.status(200).json(alerts);
  
    } catch (error) {
      console.error('Error in getting reports:', error);
      res.status(500).send('Server error during getting reports');
    }
}

module.exports = {
    createAlert,
    deleteAlert,
    getAlerts
}