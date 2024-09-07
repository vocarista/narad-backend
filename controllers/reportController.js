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

const createReport = async (req, res) => {
    const { user_id, report } = req.body;
    try {
        const { title, description, severity, type, affectedArea, latitude, longitude } = report;
        const result = await pool.query("INSERT INTO reports (user_id, title, description, created_at, incident_severity, incident_type, affected_area, latitude, longitude, upvotes) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9) RETURNING *", [user_id, title, description, severity, type, affectedArea, latitude, longitude, 1]);
        const newReport = result.rows[0];
        res.status(201).json(newReport);
    } catch (error) {
        console.error('Error in creating report:', error);
        res.status(500).send('Server error during creating report');
    }
}
const getReports = async (req, res) => {
    const { latitude, longitude, radius } = req.query;
  
    try {
      let result;
      if (!latitude || !longitude || !radius) {
        // Fetch all reports if parameters are missing
        result = await pool.query('SELECT * FROM reports');
      } else {
        // Convert latitude and longitude to float
        const lat = parseFloat(latitude);
        const long = parseFloat(longitude);
        const rad = parseFloat(radius);
  
        // Fetch reports within a certain radius
        result = await pool.query(
          "SELECT * FROM reports WHERE earth_box(ll_to_earth($1, $2), $3) @> ll_to_earth(latitude, longitude)",
          [lat, long, rad]
        );
      }
  
      const reports = result.rows;
  
      res.status(200).json(reports);
  
    } catch (error) {
      console.error('Error in getting reports:', error);
      res.status(500).send('Server error during getting reports');
    }
  };
  
  
const deleteReport = async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query('DELETE FROM reports WHERE id = $1', [id]);
        res.status(200).send('Report deleted successfully');
    } catch (error) {
        console.error('Error in deleting report:', error);
        res.status(500).send('Server error during deleting report');
    }
}

const upvote = async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query('UPDATE reports SET upvotes = upvotes + 1 WHERE report_id = $1', [id]);
        res.status(200).send('Upvoted successfully');
    } catch (error) {
        console.error('Error in upvoting report:', error);
        res.status(500).send('Server error during upvoting report');
    }
}

const downvote = async (req, res) => {
    const id = req.paarams.id;
    try {
        await pool.query('UPDATE reports SET upvotes = upvotes - 1 WHERE report_id = $1', [id]);
        res.status(200).send('Downvoted successfully');
    } catch (error) {
        console.error('Error in downvoting report:', error);
        res.status(500).send('Server error during downvoting report');
    }
}

module.exports = { createReport, getReports, deleteReport, upvote, downvote }