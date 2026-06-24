const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to check connection and auto-create the table
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to Clever Cloud MySQL database!');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        enrollment_number VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        mobile_number VARCHAR(15) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await connection.query(createTableQuery);
    console.log('Database initialized: "students" table is ready.');
    connection.release();
  } catch (error) {
    console.error('Database connection failed! Details:', error.message);
    process.exit(1); // Stop the server if we cannot connect to the database
  }
}

module.exports = {
  pool,
  initializeDatabase
};
