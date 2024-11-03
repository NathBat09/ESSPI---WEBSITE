const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: '/cloudsql/' + process.env.CLOUD_SQL_CONNECTION_NAME, 
    port: 5432,
    database: process.env.DATABASE_NAME,
    ssl: {
        rejectUnauthorized: false, 
    },
});
