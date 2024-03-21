const Pool = require("pg").Pool 

const pool = new Pool({
    user: "postgres",
    password: "Onepiece09",
    host: "localhost",
    port: 5432,
    database: "esspi"
});

module.exports = pool;
