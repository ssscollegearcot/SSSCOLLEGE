/* ═══════════════════════════════════════════════════════
   SSS COLLEGE — CLASS NOTES PORTAL
   Zero-backend • Edit this array to add notes •
   Place PDFs in notes/<dept>/ folders
═══════════════════════════════════════════════════════ */

const DEPT_LABELS = {
  'bsc-cs':'B.Sc Computer Science','bca':'BCA','bsc-data-science':'B.Sc Data Science',
  'bsc-ai':'B.Sc AI & ML','mathematics':'Mathematics','english':'English',
  'bsc-chemistry':'B.Sc Chemistry','bcom':'B.Com','bcom-ca':'B.Com CA',
  'bba':'BBA','ba-tamil':'B.A Tamil','ba-defence':'B.A Defence Studies',
  'msc-cs':'M.Sc Computer Science','mcom':'M.Com'
};

const TYPES = ['Lecture Notes','Assignment','Important Q&A','Formula Sheet','Reference'];
const TYPE_CLASS = {'Lecture Notes':'lecture','Assignment':'assignment','Important Q&A':'qa','Formula Sheet':'formula','Reference':'reference'};

/* ───────────────────────────────────────────────
   NOTES ARRAY — Edit here to add new notes
   ─────────────────────────────────────────────── */
const NOTES = [
  { id:'n001', dept:'bsc-cs', year:'I',  sem:'I',  subject:'Programming in C',          title:'Unit 1 – Introduction to C & Data Types',   type:'Lecture Notes', staff:'Sathya A',     date:'2026-06-18', file:'notes/bsc-cs/c-programming-unit1.pdf' },
  { id:'n002', dept:'bsc-cs', year:'I',  sem:'I',  subject:'Programming in C',          title:'Unit 2 – Control Structures & Functions',   type:'Lecture Notes', staff:'Sathya A',     date:'2026-06-20', file:'notes/bsc-cs/c-programming-unit2.pdf' },
  { id:'n003', dept:'bsc-cs', year:'I',  sem:'I',  subject:'Data Structures',           title:'Arrays & Linked Lists – Notes',             type:'Lecture Notes', staff:'Sathya A',     date:'2026-06-22', file:'notes/bsc-cs/data-structures-unit1.pdf' },
  { id:'n004', dept:'bsc-cs', year:'II', sem:'III', subject:'Data Structures',           title:'Trees & Graphs Overview',                   type:'Lecture Notes', staff:'Sathya A',     date:'2026-07-14', file:'notes/bsc-cs/data-structures-trees.pdf' },
  { id:'n005', dept:'bsc-cs', year:'I',  sem:'I',  subject:'Programming in C',          title:'Assignment 1 – Basic C Programs',           type:'Assignment',    staff:'Sathya A',     date:'2026-06-25', file:'notes/bsc-cs/c-assignment1.pdf' },
  { id:'n006', dept:'bsc-cs', year:'II', sem:'III', subject:'Data Structures',           title:'Important Questions – Trees & Graphs',      type:'Important Q&A', staff:'Sathya A',     date:'2026-07-15', file:'notes/bsc-cs/ds-important-qa.pdf' },
  { id:'n007', dept:'bca',    year:'I',  sem:'I',  subject:'Computer Fundamentals',     title:'Number Systems & Boolean Algebra',          type:'Lecture Notes', staff:'Priya M',      date:'2026-07-10', file:'notes/bca/fundamentals-unit1.pdf' },
  { id:'n008', dept:'bca',    year:'I',  sem:'I',  subject:'C Programming',             title:'Operators & Expressions',                   type:'Lecture Notes', staff:'Priya M',      date:'2026-07-12', file:'notes/bca/c-programming-unit1.pdf' },
  { id:'n009', dept:'bca',    year:'II', sem:'III', subject:'Data Structures',           title:'Stack & Queue – Lecture Notes',             type:'Lecture Notes', staff:'Priya M',      date:'2026-07-15', file:'notes/bca/ds-stack-queue.pdf' },
  { id:'n010', dept:'bca',    year:'I',  sem:'I',  subject:'Computer Fundamentals',     title:'Assignment 1 – Number Systems',             type:'Assignment',    staff:'Priya M',      date:'2026-07-14', file:'notes/bca/fundamentals-assignment1.pdf' },
  { id:'n011', dept:'bcom',   year:'I',  sem:'I',  subject:'Financial Accounting',      title:'Journal & Ledger Entries',                  type:'Lecture Notes', staff:'Arun K',       date:'2026-07-15', file:'notes/bcom/accounting-unit1.pdf' },
  { id:'n012', dept:'bcom',   year:'I',  sem:'I',  subject:'Business Economics',        title:'Demand & Supply Analysis',                  type:'Lecture Notes', staff:'Arun K',       date:'2026-07-13', file:'notes/bcom/economics-unit1.pdf' },
  { id:'n013', dept:'mathematics', year:'I',  sem:'I',  subject:'Calculus',            title:'Differentiation – First Principles',        type:'Lecture Notes', staff:'Meena R',      date:'2026-07-15', file:'notes/mathematics/calculus-unit1.pdf' },
  { id:'n014', dept:'mathematics', year:'I',  sem:'I',  subject:'Linear Algebra',      title:'Matrix Operations & Determinants',         type:'Lecture Notes', staff:'Meena R',      date:'2026-07-11', file:'notes/mathematics/linalg-unit1.pdf' },
  { id:'n015', dept:'bsc-chemistry', year:'II', sem:'III', subject:'Organic Chemistry', title:'Named Reactions – Revision Notes',          type:'Reference',     staff:'Ravi V',       date:'2026-07-10', file:'notes/bsc-chemistry/organic-reference.pdf' },
  { id:'n016', dept:'bba',    year:'I',  sem:'I',  subject:'Principles of Management',  title:'Functions of Management',                   type:'Lecture Notes', staff:'Nisha P',      date:'2026-07-15', file:'notes/bba/management-unit1.pdf' },
  { id:'n017', dept:'ba-tamil', year:'II', sem:'III', subject:'Tamil Literature',       title:' Sangam Literature – Summary',              type:'Lecture Notes', staff:'Kumar T',      date:'2026-07-14', file:'notes/ba-tamil/sangam-literature.pdf' },
  { id:'n018', dept:'bsc-ai',  year:'I',  sem:'I',  subject:'Introduction to AI',        title:'AI History & Applications',                 type:'Lecture Notes', staff:'Deepa S',      date:'2026-07-15', file:'notes/bsc-ai/ai-intro.pdf' },
  { id:'n019', dept:'bsc-data-science', year:'I', sem:'I', subject:'Data Science Basics', title:'Python for Data Science – Getting Started', type:'Lecture Notes', staff:'Vikram L',     date:'2026-07-12', file:'notes/bsc-data-science/python-intro.pdf' },
  { id:'n020', dept:'english', year:'I', sem:'I', subject:'Communicative English',      title:'Essay Writing Techniques',                  type:'Lecture Notes', staff:'Lakshmi D',    date:'2026-07-15', file:'notes/english/essay-writing.pdf' },
];

/* ───────────────────────────────────────────────
   INITIALISE
   ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  bindEvents();
  render();
});

function populateFilters() {
  const depts = [...new Set(NOTES.map(n => n.dept))].sort();
  const years = [...new Set(NOTES.map(n => n.year))].sort();
  const sems  = [...new Set(NOTES.map(n => n.sem))].sort();

  const fDept = document.getElementById('fDept');
  const fYear = document.getElementById('fYear');
  const fSem  = document.getElementById('fSem');
  const fType = document.getElementById('fType');

  depts.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = DEPT_LABELS[d] || d; fDept.appendChild(o); });
  years.forEach(y => { const o = document.createElement('option'); o.value = y; o.textContent = y + ' Year'; fYear.appendChild(o); });
  sems.forEach(s  => { const o = document.createElement('option'); o.value = s; o.textContent = 'Sem ' + s; fSem.appendChild(o); });
  TYPES.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; fType.appendChild(o); });
}

function bindEvents() {
  ['fDept','fYear','fSem','fType','fSearch','fDate','fSort'].forEach(id => {
    document.getElementById(id).addEventListener('input', render);
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    ['fDept','fYear','fSem','fType','fSearch','fDate'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('fSort').value = 'newest';
    render();
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('pdfModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
}

/* ───────────────────────────────────────────────
   FILTER + RENDER
   ─────────────────────────────────────────────── */
function render() {
  const dept   = document.getElementById('fDept').value;
  const year   = document.getElementById('fYear').value;
  const sem    = document.getElementById('fSem').value;
  const type   = document.getElementById('fType').value;
  const search = document.getElementById('fSearch').value.trim().toLowerCase();
  const dateR  = document.getElementById('fDate').value;
  const sort   = document.getElementById('fSort').value;

  const now = new Date();
  const today    = now.toISOString().split('T')[0];
  const weekAgo  = new Date(now.getTime() - 7*24*60*60*1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getFullYear(), now.getMonth()-1, now.getDate()).toISOString().split('T')[0];

  let filtered = NOTES.filter(n =>
    (!dept   || n.dept === dept) &&
    (!year   || n.year === year) &&
    (!sem    || n.sem === sem) &&
    (!type   || n.type === type) &&
    (!search || (n.title + ' ' + n.subject).toLowerCase().includes(search)) &&
    (!dateR  || (dateR === 'today' && n.date === today) ||
                (dateR === 'week' && n.date >= weekAgo) ||
                (dateR === 'month' && n.date >= monthAgo))
  );

  if (sort === 'newest')       filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
  else if (sort === 'oldest')  filtered.sort((a,b) => new Date(a.date) - new Date(b.date));
  else if (sort === 'subject') filtered.sort((a,b) => a.subject.localeCompare(b.subject));

  renderGrid(filtered);
  updateStats(filtered);
}

function renderGrid(notes) {
  const grid  = document.getElementById('notesGrid');
  const empty = document.getElementById('emptyState');

  if (!notes.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = notes.map(n => `
    <div class="note-card" onclick="openNote('${n.id}')">
      <div class="note-header">
        <span class="note-type type-${TYPE_CLASS[n.type] || 'lecture'}">${n.type}</span>
        <div class="note-title">${n.title}</div>
        <div class="note-subject">${n.subject}</div>
      </div>
      <div class="note-body">
        <div class="note-meta">
          <span>👤 ${n.staff}</span>
          <span>🏫 ${DEPT_LABELS[n.dept] || n.dept} — ${n.year} Year Sem ${n.sem}</span>
        </div>
      </div>
      <div class="note-footer">
        <span class="note-date">📅 ${formatDate(n.date)}</span>
        <button class="note-btn">View PDF →</button>
      </div>
    </div>
  `).join('');
}

function updateStats(notes) {
  document.getElementById('totalNotes').textContent = notes.length;
  document.getElementById('totalDepts').textContent = new Set(notes.map(n => n.dept)).size;
  document.getElementById('totalSubjects').textContent = new Set(notes.map(n => n.subject)).size;
  document.getElementById('resultCount').textContent = `Showing ${notes.length} note${notes.length !== 1 ? 's' : ''}`;
}

/* ───────────────────────────────────────────────
   PDF MODAL
   ─────────────────────────────────────────────── */
function openNote(id) {
  const n = NOTES.find(x => x.id === id);
  if (!n) return;
  document.getElementById('modalTitle').textContent = n.title;
  document.getElementById('modalSubject').textContent = n.subject;
  document.getElementById('modalStaff').textContent = n.staff;
  document.getElementById('modalDate').textContent = formatDate(n.date);
  document.getElementById('modalType').textContent = n.type;
  document.getElementById('pdfFrame').src = n.file;
  document.getElementById('downloadBtn').href = n.file;
  document.getElementById('downloadBtn').setAttribute('download', n.title.replace(/[^a-zA-Z0-9]/g,'_') + '.pdf');
  document.getElementById('pdfModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('pdfModal').classList.remove('active');
  document.getElementById('pdfFrame').src = '';
  document.body.style.overflow = '';
}

/* ───────────────────────────────────────────────
   HELPERS
   ─────────────────────────────────────────────── */
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
