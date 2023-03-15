mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "vidientu",
  password: "1234",
});
module.exports = pool;
