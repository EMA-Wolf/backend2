const express = require('express');
const app = express();
const mysql = require('mysql');
const { Pool } = require('pg');
const cors = require("cors");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Middleware
app.use(cors());;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_DBNAME
});


app.get("/", (req, res) => {
    const sql = "SELECT * FROM `details`";
    db.query(sql, (err, results) => {
        if (err) return res.json(err);
        if (results.length > 0) {
            return res.json(results);
        } else {
            return res.json("Failed");
        }
    });
});


// Create a PostgreSQL pool connection
// const pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DBNAME,
//     port: process.env.DB_PORT||5431,
//     ssl: 'require',
//   });
  
//   // Test endpointz
//   app.get('/', async (req, res) => {
//     try {
//       const results = await pool.query('SELECT * FROM contacts');
//       if (results.rows.length > 0) {
//         res.json(results.rows);
//       } else {
//         res.json('Failed');
//       }
//     } catch (err) {
//       res.json(err);
//     }
//   });

const PORT = process.env.PORT||3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});