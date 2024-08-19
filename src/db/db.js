 
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'bgjo6wpqzweglg5jn2m0-mysql.services.clever-cloud.com',
  user: 'uxkdlftngtwx5f5s',
  password: '63qSLEZl49b84Ig7EnyK',
  database: 'bgjo6wpqzweglg5jn2m0',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();