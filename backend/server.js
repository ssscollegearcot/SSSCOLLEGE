const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));

// Helper to load JSON data
const loadData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', college: 'SSS College of Arts, Science & Management', version: '1.0.0' });
});

// ── Announcements ──────────────────────────────────────────────────────────────
app.get('/api/announcements', (req, res) => {
  try {
    const announcements = loadData('announcements.json');
    const { category } = req.query;
    if (category) {
      return res.json(announcements.filter(a => a.category === category));
    }
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load announcements' });
  }
});

app.get('/api/announcements/important', (req, res) => {
  try {
    const announcements = loadData('announcements.json');
    res.json(announcements.filter(a => a.important));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load important announcements' });
  }
});

// ── Departments ────────────────────────────────────────────────────────────────
app.get('/api/departments', (req, res) => {
  try {
    const departments = loadData('departments.json');
    const { category, degree } = req.query;
    let filtered = departments;
    if (category) filtered = filtered.filter(d => d.category === category);
    if (degree) filtered = filtered.filter(d => d.degree === degree);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load departments' });
  }
});

app.get('/api/departments/:id', (req, res) => {
  try {
    const departments = loadData('departments.json');
    const dept = departments.find(d => d.id === req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load department' });
  }
});

// ── Question Papers ────────────────────────────────────────────────────────────
app.get('/api/qpapers', (req, res) => {
  try {
    const papers = loadData('qpapers.json');
    const { dept, year, semester, degree } = req.query;
    let filtered = papers;
    if (dept) filtered = filtered.filter(p => p.dept === dept);
    if (year) filtered = filtered.filter(p => p.year === parseInt(year));
    if (semester) filtered = filtered.filter(p => p.semester === semester);
    if (degree) filtered = filtered.filter(p => p.degree === degree);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load question papers' });
  }
});

app.get('/api/qpapers/:dept', (req, res) => {
  try {
    const papers = loadData('qpapers.json');
    const deptPapers = papers.filter(p => p.dept === req.params.dept);
    res.json(deptPapers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load question papers for department' });
  }
});

// ── Placements ─────────────────────────────────────────────────────────────────
app.get('/api/placements', (req, res) => {
  try {
    const placements = loadData('placements.json');
    res.json(placements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load placements data' });
  }
});

// ── Student Login ──────────────────────────────────────────────────────────────
// Sample student credentials (in production, use a real database with hashed passwords)
const SAMPLE_STUDENTS = [
  { rollNo: 'SSS001', password: 'student123', name: 'Karthik R', dept: 'B.Sc Computer Science', semester: 'V', year: '2024-25' },
  { rollNo: 'SSS002', password: 'student123', name: 'Priya M', dept: 'B.Com', semester: 'III', year: '2024-25' },
  { rollNo: 'SSS003', password: 'student123', name: 'Arjun S', dept: 'BCA', semester: 'I', year: '2025-26' },
];

app.post('/api/student/login', (req, res) => {
  const { rollNo, password } = req.body;
  if (!rollNo || !password) {
    return res.status(400).json({ success: false, message: 'Roll number and password are required' });
  }
  const student = SAMPLE_STUDENTS.find(s => s.rollNo === rollNo && s.password === password);
  if (student) {
    const { password: _, ...safeStudent } = student;
    res.json({ success: true, message: 'Login successful', student: safeStudent });
  } else {
    res.status(401).json({ success: false, message: 'Invalid roll number or password' });
  }
});

// ── Staff Portal Login ─────────────────────────────────────────────────────────
const SAMPLE_STAFF = [
  { staffId: 'STAFF001', password: 'staff123', name: 'Dr. S. Rajkumar', dept: 'B.Sc Computer Science', designation: 'HoD & Associate Professor' },
  { staffId: 'STAFF002', password: 'staff123', name: 'Mrs. K. Priya', dept: 'BCA', designation: 'Assistant Professor' },
];

app.post('/api/staff/login', (req, res) => {
  const { staffId, password } = req.body;
  if (!staffId || !password) {
    return res.status(400).json({ success: false, message: 'Staff ID and password are required' });
  }
  const staff = SAMPLE_STAFF.find(s => s.staffId === staffId && s.password === password);
  if (staff) {
    const { password: _, ...safeStaff } = staff;
    res.json({ success: true, message: 'Login successful', staff: safeStaff });
  } else {
    res.status(401).json({ success: false, message: 'Invalid staff ID or password' });
  }
});

// ── Contact Form ───────────────────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required' });
  }
  // In production, send email or save to DB
  console.log('Contact Form Submission:', { name, email, phone, subject, message });
  res.json({ success: true, message: 'Your message has been received. We will contact you within 2 working days.' });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎓 SSS College API Server Running`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health\n`);
});
