const { pool } = require('./database_pg');

const performQuery = async () => {
    try {
        const result = await pool.query('SELECT * FROM your_table');
        console.log(result.rows);
    } catch (error) {
        console.error('Error executing query:', error.message);
    }
};

performQuery();
