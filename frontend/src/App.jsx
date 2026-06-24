import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'directory'
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    enrollment_number: '',
    email: '',
    mobile_number: '',
    branch: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  // Backend Base API URL
  const API_URL = 'http://localhost:5000/api/students';

  // Fetch all students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to retrieve student records.');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      showAlert('error', 'Error loading database records. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to show alert banner and auto-dismiss
  const showAlert = (type, message) => {
    setAlert({ type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Clear alert after 5 seconds
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, enrollment_number, email, mobile_number, branch } = formData;

    // 1. Basic validation check
    if (!name.trim() || !enrollment_number.trim() || !email.trim() || !mobile_number.trim() || !branch) {
      showAlert('error', 'Please fill in all the registration fields.');
      return;
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('error', 'Please enter a valid email address.');
      return;
    }

    // 3. Phone number validation (digits only, length 10 to 15)
    const cleanMobile = mobile_number.replace(/\D/g, '');
    if (cleanMobile.length < 10 || cleanMobile.length > 15) {
      showAlert('error', 'Mobile number should contain between 10 and 15 digits.');
      return;
    }

    try {
      setSubmitting(true);
      setAlert(null);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server error occurred during submission.');
      }

      // Success
      showAlert('success', result.message || 'Student registered successfully!');

      // Clear form
      setFormData({
        name: '',
        enrollment_number: '',
        email: '',
        mobile_number: '',
        branch: ''
      });

      // Update state list (prepend new student to the top of list)
      setStudents((prev) => [result.student, ...prev]);

      // Redirect user to the Directory tab after 1 second so they see their entry
      setTimeout(() => {
        setActiveTab('directory');
      }, 1000);

    } catch (error) {
      console.error('Submission error:', error);
      showAlert('error', error.message || 'Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete student record
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete student.');
      }

      showAlert('success', result.message || 'Student record deleted successfully.');

      // Update state (remove deleted student from local array)
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      showAlert('error', error.message || 'Failed to delete student record.');
    }
  };

  // Map database branch strings to lower-kebab-case for CSS badges styling
  const getBranchBadgeClass = (branch) => {
    if (!branch) return 'other';
    return branch.toLowerCase().replace(/[\s&]+/g, '-');
  };

  // Search Filter logic
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.enrollment_number.toLowerCase().includes(query) ||
      student.branch.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="app-container">
      {/* Page Header */}
      <header className="app-header">
        <h1 className="app-title">Student Registration</h1>
        <p className="app-subtitle">Administrative panel for student registrations and directory lookup</p>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <span>📝</span> Register Student
        </button>
        <button
          className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          <span>🎓</span> Student Directory ({students.length})
        </button>
      </nav>

      {/* Alert Banner */}
      {alert && (
        <div className={`alert-box alert-${alert.type}`}>
          <span>{alert.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-content">

        {/* TAB 1: Registration Form */}
        {activeTab === 'register' && (
          <section className="glass-panel form-panel">
            <h2 className="panel-title">
              <span></span> Student Registeration Form
            </h2>
            <form className="registration-form" onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Enter student's full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="enrollment_number" className="form-label">Enrollment Number</label>
                <input
                  id="enrollment_number"
                  name="enrollment_number"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 0101CS221054"
                  value={formData.enrollment_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile_number" className="form-label">Mobile Number</label>
                <input
                  id="mobile_number"
                  name="mobile_number"
                  type="tel"
                  className="form-input"
                  placeholder="Enter mobile number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="branch" className="form-label">Academic Branch</label>
                <select
                  id="branch"
                  name="branch"
                  className="form-input"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select Department</option>
                  <option value="Computer Science">Computer Science (CS)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Electronics and Communication">Electronics & Comm (EC)</option>
                  <option value="Electronics and Instrumentation">Electronics & Instrumentation (EI)</option>
                  <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                  <option value="Civil Engineering">Civil Engineering (CE)</option>
                  <option value="Biomedical Engineering">Biomedical Engineering (BME)</option>
                  <option value="Industrial Production">Industrial Production (IP)</option>
                  <option value="Other">Other Branch</option>
                </select>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Registration</span>
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* TAB 2: Students Directory */}
        {activeTab === 'directory' && (
          <section className="glass-panel directory-panel">
            <div className="panel-header-row">
              <h2 className="panel-title">
                <span></span> Student Directory
              </h2>
              <div className="search-box-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder=" Search name, roll, branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📂</span>
                <p>
                  {searchQuery.trim()
                    ? `No student records match "${searchQuery}".`
                    : 'No student records found in MySQL. Register a student first!'}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Enrollment No.</th>
                      <th>Email / Phone</th>
                      <th>Branch</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id || student.enrollment_number}>
                        <td>
                          <span className="student-name">{student.name}</span>
                        </td>
                        <td>
                          <code>{student.enrollment_number}</code>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{student.email}</div>
                          <div style={{ fontSize: '0.8rem', marginTop: '2px', opacity: 0.8 }}>{student.mobile_number}</div>
                        </td>
                        <td>
                          <span className={`branch-badge ${getBranchBadgeClass(student.branch)}`}>
                            {student.branch}
                          </span>
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(student.id)}
                            title="Delete Record"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
