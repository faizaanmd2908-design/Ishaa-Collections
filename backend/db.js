require('dotenv').config();

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        rejectUnauthorized: true
    }
});

module.exports = db;