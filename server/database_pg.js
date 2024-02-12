const Pool = require("pg").Pool 

const pool = new Pool({
    user: "postgres",
    password: "Onepiece09",
    host: "localhost",
    port: 5432,
    database: "login_page"
});

module.exports = pool;