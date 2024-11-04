require('dotenv').config(); // Load environment variables from .env

const { Pool } = require("pg"); // Import Pool from pg

// Initialize the Pool instance with the database connection details
const pool = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME
});

module.exports = pool;
