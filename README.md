# Student Registration Platform

A full-stack Student Registration System built with **React (Vite)** for the frontend, **Node.js + Express** for the backend REST API, and **Clever Cloud MySQL** for cloud database storage. 

---

## Features

- **Neo-Brutalist Comic UI Theme**: Cream-colored retro design with bold black edges, stark 3D shadows, and smooth button animation effects.
- **Tabbed Admin Dashboard**: Elegant and neat one-pane tabbed view to switch between the Registration form and the wide Student Directory pane.
- **Directory Search**: Live multi-column search based on fields of Name, Enrolled Year, Branch, and Email ID.
- **Branch Tags**: Distinct tags for the 9 branches of study (CS, IT, EC, EI, EE, ME, CE, BME, and IP).
- **Deletion Confirmation Trigger**: Quick management of the input entries with an active deletion confirmation mechanism.
- **Automatic Backend Initialization**: The Node.js server automatically connects to Clever Cloud and initializes the MySQL students table.
- **Updated Tech Stack and Security**: Styled with Manrope geometric font, and secured with local environment variables.

---

## Tech Stack

* **Frontend**: React (Vite), Manrope Font (via Google Fonts), Custom Comic CSS Styles
* **Backend**: Node.js, Express.js, CORS, Dotenv
* **Database**: MySQL (hosted on Clever Cloud)

---

## Directory Structure

```text
student-registration/
│
├── .gitignore                # Global git ignore configuration
├── package.json              # Root package to run concurrently
├── README.md                 # Project user guide
│
├── backend/                  # Node.js + Express server
│   ├── db.js                 # DB connection and auto-table initialization
│   ├── server.js             # Server API endpoints (GET, POST, DELETE)
│   ├── .env                  # Configuration variables (DB Host, User, Pass)
│   └── package.json          # Server dependencies
│
└── frontend/                 # React frontend
    ├── index.html            # Main HTML document (loads Manrope font)
    ├── src/
    │   ├── App.jsx           # Tab selector, form inputs, directory list table
    │   ├── App.css           # Neo-Brutalist cartoon styles
    │   ├── main.jsx          # React app gateway
    │   └── index.css         # Reset rules
    └── package.json          # React dependencies
```

---

## Getting Started

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Recommended: Run Both Frontend & Backend Together (One Command)

You can run both the frontend and backend simultaneously using a single command from the project's root folder:

1. Open your terminal in the root project folder.
2. If this is your first time, install the root packages:
   ```bash
   npm install
   ```
3. Run the start command:
   ```bash
   npm start
   ```
   *This will run both servers side-by-side.* You can then open `http://localhost:5173` to view the app!

---

### Alternative: Run Frontend and Backend in Separate Terminals

If you prefer to run them separately, open two terminal windows:

#### **Terminal 1: Backend Server**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Start the server:
   ```bash
   npm start
   ```

#### **Terminal 2: Frontend Client**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the development client:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## API Endpoints

### 1. GET `/api/students`
- **Description**: Retrieves all registered students, sorted by date registered (newest first).
- **Response**: List of student objects.

### 2. POST `/api/students`
- **Description**: Registers a new student.
- **Request Body** (JSON):
  ```json
  {
    "name": "Alex Mercer",
    "enrollment_number": "0101CS221054",
    "email": "alex.m@example.com",
    "mobile_number": "9876543210",
    "branch": "Computer Science"
  }
  ```
- **Responses**:
  - `201 Created`: Student registered successfully.
  - `400 Bad Request`: Validation failure (empty field, invalid email/mobile format).
  - `409 Conflict`: Duplicate email or enrollment number.
  - `500 Internal Error`: Database connection issue.

### 3. DELETE `/api/students/:id`
- **Description**: Deletes a student record by database ID.
- **Params**: `id` (database primary key ID).
- **Responses**:
  - `200 OK`: Record deleted successfully.
  - `404 Not Found`: Student record not found in database.
  - `500 Internal Error`: Database connection issue.

---

## Database Schema

The automatically generated table structure in MySQL is:

```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    enrollment_number VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(15) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
