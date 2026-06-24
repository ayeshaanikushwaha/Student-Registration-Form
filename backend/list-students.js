const { pool } = require('./db');

async function listStudents() {
  try {
    const [rows] = await pool.query('SELECT * FROM students');
    console.log('CURRENT_DATABASE_RECORDS:');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listStudents();
