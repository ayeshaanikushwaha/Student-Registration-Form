const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend (running on another port) can access this server
app.use(cors());

// Enable parsing of JSON request bodies
app.use(express.json());

// Initialize connection and database schema verification
initializeDatabase();

// Route: GET all students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ error: 'Failed to retrieve students database records.' });
  }
});

// Route: POST a new student
app.post('/api/students', async (req, res) => {
  const { name, enrollment_number, email, mobile_number, branch } = req.body;

  // Basic empty field checks
  if (!name || !enrollment_number || !email || !mobile_number || !branch) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const cleanName = name.trim();
  const cleanEnrollment = enrollment_number.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanMobile = mobile_number.trim();
  const cleanBranch = branch.trim();

  // Basic email pattern regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Basic mobile number pattern validation (digits, spaces, hyphens, plus sign)
  const mobileRegex = /^[0-9+\-\s()]{10,15}$/;
  if (!mobileRegex.test(cleanMobile)) {
    return res.status(400).json({ error: 'Please enter a valid mobile number (10-15 digits).' });
  }

  try {
    // Insert new student query
    const insertQuery = `
      INSERT INTO students (name, enrollment_number, email, mobile_number, branch)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertQuery, [
      cleanName,
      cleanEnrollment,
      cleanEmail,
      cleanMobile,
      cleanBranch
    ]);

    // Send successful response with new student details
    res.status(201).json({
      message: 'Student registered successfully!',
      student: {
        id: result.insertId,
        name: cleanName,
        enrollment_number: cleanEnrollment,
        email: cleanEmail,
        mobile_number: cleanMobile,
        branch: cleanBranch
      }
    });
  } catch (error) {
    console.error('Database query error:', error.message);

    // Capture MySQL duplicate record error (code: ER_DUP_ENTRY)
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('enrollment_number')) {
        return res.status(409).json({ error: 'This Enrollment Number is already registered.' });
      }
      if (error.message.includes('email')) {
        return res.status(409).json({ error: 'This Email is already registered.' });
      }
      return res.status(409).json({ error: 'A student with this Enrollment Number or Email already exists.' });
    }

    res.status(500).json({ error: 'Server database error. Failed to save student record.' });
  }
});

// Route: DELETE a student by ID
app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student record not found.' });
    }
    res.status(200).json({ message: 'Student record deleted successfully!' });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ error: 'Failed to delete student record.' });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
