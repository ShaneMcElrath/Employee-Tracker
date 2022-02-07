const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '792KykXY!Yng',
  database: 'company'
});

module.exports = db;