/* ═══════════════════════════════════════════════════════════
   SSS COLLEGE — MAIN JAVASCRIPT (Complete Rebuild)
   Includes: Routing, Departments, Staff per Dept, Faculty Page,
             Q-Papers, Login, Placements, Gallery, Slider
═══════════════════════════════════════════════════════════ */
'use strict';

/* ═════════════════════════════════════════════════════════
   BACKEND API CONNECTION
   Change API_BASE to your deployed backend URL in production
   (see backend/README.md for setup + deployment instructions)
═════════════════════════════════════════════════════════ */
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:4000/api'
  : 'https://YOUR-DEPLOYED-BACKEND-URL.com/api'; // ← replace after deploying backend/

async function apiRequest(path, options = {}) {
  const opts = { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } };
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  let res;
  try {
    res = await fetch(API_BASE + path, opts);
  } catch (e) {
    throw new Error('Could not reach the server. Is the backend running? See backend/README.md');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Convert a DB note row (snake_case) into the shape the UI already expects
function normalizeNote(n) {
  return {
    id: String(n.id),
    dept: n.dept,
    deptName: n.dept_name,
    year: n.year,
    sem: n.sem,
    subject: n.subject,
    title: n.title,
    topics: n.topics,
    content: n.content,
    type: n.type,
    staffId: n.staff_id,
    staffName: n.staff_name,
    date: (n.created_at || '').split(' ')[0],
    timestamp: n.created_at ? new Date(n.created_at.replace(' ', 'T')).getTime() : Date.now()
  };
}

// In-memory cache of the notes currently on screen, keyed by id, so
// openNoteModal()/deleteNote() can look them up without a re-fetch.
let notesById = {};
function cacheNotes(notes) { notes.forEach(n => { notesById[n.id] = n; }); return notes; }

/* ─── Image base paths ────────────────────────────────────── */
const IMG  = 'images/';
const GAL  = 'images/Gallery/';
const STAF = 'images/staff/';

/* ─────────────────────────────────────────────────────────
   STAFF DATA  (3–4 staff per department)
   photo: filename inside images/staff/ — uses AI-generated
   avatarColor: fallback background colour for initials
───────────────────────────────────────────────────────── */
const STAFF_DATA = [
  /* ── B.Sc Computer Science ── */
  { id:'s01', dept:'bsc-cs', deptName:'B.Sc Computer Science',
    name:'Sathya A', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'MCA., M.Phil., B.Ed., UGC-NET', exp:'7 Years',
    spec:'Programming, Computer Networks, Web Technologies, Database Management Systems, Operating Systems, Python Programming, and Embedded Software Development, with research interests in Computer Networks, Web Technologies, and Embedded Software Development', photo:'BCS.CS.HOD.jpeg',
    avatarColor:'#9b2335', publications:'Sathya A is an enthusiastic and dedicated academician with over 7 years of teaching experience in Computer Science. Currently serving as an Assistant Professor at SSS College of Arts, Science and Management, Arcot, she is committed to delivering quality education, fostering innovation, and mentoring students to achieve academic and professional excellence. Her areas of expertise include Programming, Computer Networks, Web Technologies, Database Management Systems, Operating Systems, Python Programming, and Embedded Software Development, with research interests in Computer Networks, Web Technologies, and Embedded Software Development. She actively participates in academic activities, curriculum development, faculty development programmes, seminars, workshops, and continuous professional learning to stay updated with emerging technologies and advancements in Computer Science.',
    email:'-', phone:'-', joined:'2019' },
    { id:'s02', dept:'bsc-cs', deptName:'B.Sc Computer Science',
    name:'P.Monisha ', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.C.A., M.Phil.', exp:'04 Years',
    spec:'Java Programming, Web Technologies, OOP', photo:'P.Monisha.jpeg',
    avatarColor:'#949a1a', publications:'P.Monisha, M.C.A., M.Phil. is an enthusiastic and dedicated academician with over 4 years of teaching experience in the field of Computer Science. Currently serving as an Assistant Professor, she is committed to delivering quality education, fostering innovation, and mentoring students to achieve academic and professional excellence. Her areas of expertise include Programming, Computer Networks, Database Management Systems, Operating Systems, Python Programming, Web Technologies, Machine Learning, and Internet of Things (IoT). She adopts student-centered teaching methodologies that encourage critical thinking, problem-solving, practical learning, and research-oriented education. Her research interests include Machine Learning, Computer Networks, Web Technologies, and Internet of Things (IoT). She actively participates in academic activities, curriculum development, faculty development programmes, seminars, workshops, and continuous professional learning to stay updated with emerging technologies and advanceme',
    email:'-', phone:'-', joined:'2015' },
  { id:'s03', dept:'bsc-cs', deptName:'B.Sc Computer Science',
    name:'Prof.N.Venugopal ', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.C.A., M.Phil., B.Ed.,', exp:'11 Years',
    spec:'Java Programming, Web Technologies, OOP', photo:'N.Venugopal.jpeg',
    avatarColor:'#1a5a9a', publications:'Prof. N. Venugopal, M.C.A., M.Phil., B.Ed., has been an integral part of our institution, serving with distinction as an Assistant Professor in the PG Department of Computer Science for a total duration of 16 Years experience .He demonstrated exceptional academic leadership, instructional expertise, and a deep commitment to student mentorship. He has successfully handled advanced curriculum design, laboratory sessions, and academic projects, specializing in a robust suite of technical disciplines, including: ​Core Programming & Development: Core Java, Android Application Development, and PHP. Data & Systems Management: Relational Database Management Systems (RDBMS). ​Advanced Technologies: Machine Learning concepts and applications.​Design & Productivity Suites: Adobe Photoshop and MS Office.​Beyond his classroom teaching, he has been actively involved in departmental administration, curriculum development, and organizing technical workshops. His proficiency in bridging foundational computer science principles with modern machine learning frameworks and development tools has greatly enriched our academic programs.',
    email:'-', phone:'-', joined:'2015' },
     { id:'s04', dept:'bsc-cs', deptName:'B.Sc Computer Science',
    name:'Fathima Bi K. S. M.S ', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.C.A., M.Phil., B.Ed.,', exp:'11 Years',
    spec:'Java Programming, Web Technologies, OOP', photo:'Fathima Bi K. S. M.S .jpeg',
    avatarColor:'#1a5a9a', publications:'Dedicated and result-oriented professional with 14 years of combined experience in the technology and education sectors. I possess a unique blend of high-level technical proficiency and advanced pedagogical skills. I have spent 8 years in MNC, specializing in .NET development and managing complex enhancement projects for global clients. Complementing this is 6 years of experience as a Computer Science educator, where I have taught various programming languages and core computer science concepts to diverse student groups. Expertise in .NET, C, C++, and Python, R language experienced in Shell projects, website content publishing, and large-scale migrations.Skilled in curriculum development and instruction across subjects including DBMS, Operating Systems, Machine Learning, and Web Technologies (HTML, Visual Basic).Utilized TOAD for database management and reporting tasks. Advanced Certifications: Currently exploring advanced data science specializations (AI and Machine Learning) through Great Learning .Technical Upskilling: Active contributor on Salesforce Trailhead (Explorer Rank) with a focus on Agent force and Data Cloud.',
    email:'-', phone:'-', joined:'2015' },
     { id:'s05', dept:'bsc-cs', deptName:'B.Sc Computer Science',
    name:'Yogeshwari G.', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc., B.Ed.', exp:'1 Years',
    spec:'Software Engineering, C Programming, DBMS', photo:'Yogeshwari G..jpeg',
    avatarColor:'#5a1a8a', publications:'Description:  dedicated Computer Science faculty member in  SSS College of Arts Science of management with 1 year experience. She is passionate about teaching computer science and helping students develop technical knowledge and problem-solving skills. She teaches python programming, databases management system and data structures and algorithms.They help students understand program and software development, databases, networking, artificial intelligence, and other practical sessions, guides student projects, and supports students in achieving their academic and career goals.',
    email:'-', phone:'-', joined:'2024' },
    

  /* ── B.C.A ── */
  { id:'s06', dept:'bca', deptName:'B.C.A',
    name:'Sangeetha D', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'MCA, B.Ed', exp:'15 Years',
    spec:'C, C++, and Python, and I have extensive experience in Java', photo:'Sangeetha D.jpeg',
    avatarColor:'#9b2335', publications:'I am Sangeetha D, an Assistant Professor in the Department of Computer Applications, with four years of teaching experience. I have completed my Master of Computer Applications (MCA) and Bachelor of Education (B.Ed.). My strongest areas of expertise include Operating Systems and Software Engineering. I am proficient in programming languages such as C, C++, and Python, and I have extensive experience in Java. I also possess knowledge of Machine Learning and have a keen interest in emerging technologies. I am passionate about teaching and strive to create an engaging learning environment that enables students to build strong technical knowledge, practical skills, and problem-solving abilities, preparing them for successful careers in the field of computer applications.',
    email:'-', phone:'-', joined:'2009' },
      { id:'s07', dept:'bca', deptName:'B.C.A',
    name:'J. Anitha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'MCA., M.Ed., M.Phil ', exp:'8 Years',
    spec:'Computer Networks, Operating Systems, Python', photo:'Anitha.jpeg',
    avatarColor:'#2a6a4a', publications:'a passionate academician with over 8 years of teaching experience. Currently serving as Assistant Professor at SSS College of Arts, Science and Management, Arcot, she is committed to providing quality education by integrating technical knowledge with effective pedagogical practices.Her areas of specialization include Python Programming, Java Programming, Database Management Systems, Web Technologies, Operating Systems, and Educational Technology. She adopts student-centered teaching approaches that emphasize problem-solving, practical application, and research-oriented learning..',
    email:'-', phone:'-', joined:'2020' },
    { id:'s08', dept:'bca', deptName:'B.C.A',
    name:'ILAVARASI T R', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'MCA., B.Ed.,', exp:'11 Years',
    spec:'Software Engineering, C Programming, DBMS', photo:'ILAVARASI.jpeg',
    avatarColor:'#5a1a8a', publications:'I am a passionate educator with 11 years of teaching experience. I have completed my MCA and B.Ed.  My areas of expertise include Computer Science subjects like C++, Data Structures, DBMS, Python, Mobile Computing, Software Engineering, R programming, and Operating Systems. Over the years I have helped students build strong fundamentals in programming and computer concepts. I enjoy explaining technical topics in a simple way and guiding students through practical learning. I’m dedicated, student-focused, and always eager to learn new technologies.',
    email:'-', phone:'-', joined:'2017' },
    { id:'s09', dept:'bca', deptName:'B.C.A',
    name:'Santhiya .K', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'MCA, B.Ed.', exp:'2 Years',
    spec:'Software Engineering, C Programming, DBMS', photo:'Santhiya.jpeg',
    avatarColor:'#5a1a8a', publications:'dedicated Computer Application faculty member in  SSS College of Arts Science of management with 2 year experience. She is passionate about teaching computer application and helping students develop technical knowledge and problem-solving skills. She teaches python programming, databases management system and data structures and algorithms.They help students understand program and software development, databases, networking, artificial intelligence, and other practical sessions, guides student projects, and supports students in achieving their academic and career goals.',
    email:'-', phone:'-', joined:'2019' },
    { id:'s10', dept:'bca', deptName:'B.C.A',
    name:'V. Surekha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc., M.Phil.', exp:'11 Years',
    spec:'Software Engineering, C Programming, DBMS', photo:'Surekha.jpeg',
    avatarColor:'#5a1a8a', publications:' I am V. Surekha, an Assistant Professor in the Department of Bachelor of Computer Applications (BCA). I hold M.Sc. and M.Phil. degrees in Computer Science and am passionate about teaching and mentoring students,I strive to create an engaging and student-friendly learning environment by combining theoretical concepts with practical applications. My areas of teaching include Database Management Systems (DBMS), Enterprise Resource Planning (ERP), Cloud Computing, C++ Programming, Office Automation, and other computer science subjects,I encourage students to develop strong analytical, problem-solving, and programming skills that prepare them for academic success and professional careers. I am committed to continuous learning, academic excellence, and helping students build confidence in the ever-evolving field of computer science ,My goal is to inspire students to become skilled professionals who can contribute effectively to the IT industry and society.',
    email:'-', phone:'-', joined:'2017' },
  
  /* ── B.Sc Data Science ── */
  { id:'s53', dept:'bsc-data-science', deptName:'B.Sc Data Science',
    name:'Dr. A. Priya Dharshini', desig:'HOD', fullTitle:'Head of Department & Assistant Professor',
    qual:'M.Sc. (Statistics), M.Phil., Ph.D.', exp:'12 Years',
    spec:'Machine Learning, Data Visualization, R Programming', photo:'staff_female_3_1783430743766.jpg',
    avatarColor:'#5a1a8a', publications:'11 papers in Scopus/Web of Science journals. Anna University Ph.D.',
    email:'priyadharshini.ds@ssscollege.edu.in', phone:'+91 99400 11401', joined:'2012' },
  { id:'s54', dept:'bsc-data-science', deptName:'B.Sc Data Science',
    name:'Mr. S. Vishnu Vardhan', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Data Science), (Ph.D. pursuing)', exp:'5 Years',
    spec:'Python, Deep Learning, Big Data Analytics', photo:'staff_male_2_1783430692518.jpg',
    avatarColor:'#1a5a9a', publications:'Google-certified Data Analytics Professional.',
    email:'vishnu.ds@ssscollege.edu.in', phone:'+91 99400 11402', joined:'2019' },
  { id:'s11', dept:'bsc-data-science', deptName:'B.Sc Data Science',
    name:'Ms. R. Keerthana', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (CS), M.Phil.', exp:'4 Years',
    spec:'Business Intelligence, Statistics, SQL', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#2a6a4a', publications:'1 paper in national conference. IBM certified.',
    email:'keerthana.ds@ssscollege.edu.in', phone:'+91 99400 11403', joined:'2020' },

  /* ── B.Sc Artificial Intelligence ── */
  { id:'s12', dept:'bsc-ai', deptName:'B.Sc Artificial Intelligence',
    name:'Dr. M. Suriya Prabha', desig:'HOD', fullTitle:'Head of Department & Assistant Professor',
    qual:'M.Sc. (CS), M.Phil., Ph.D. (AI)', exp:'10 Years',
    spec:'Artificial Intelligence, NLP, Computer Vision', photo:'staff_female_3_1783430743766.jpg',
    avatarColor:'#8a3a00', publications:'9 research papers in AI/ML journals. NVIDIA AI certified.',
    email:'suriya.ai@ssscollege.edu.in', phone:'+91 99400 11501', joined:'2014' },
  { id:'s13', dept:'bsc-ai', deptName:'B.Sc Artificial Intelligence',
    name:'Mr. D. Bharath', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Tech. (AI & ML), M.Phil.', exp:'4 Years',
    spec:'Neural Networks, Python for AI, Robotics', photo:'staff_male_2_1783430692518.jpg',
    avatarColor:'#1a3a7a', publications:'TensorFlow and PyTorch certified developer.',
    email:'bharath.ai@ssscollege.edu.in', phone:'+91 99400 11502', joined:'2020' },
  { id:'s14', dept:'bsc-ai', deptName:'B.Sc Artificial Intelligence',
    name:'Ms. K. Divya Bharathi', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (IT), M.Phil.', exp:'3 Years',
    spec:'Expert Systems, Ethics in AI, Cloud Computing', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#5a1a8a', publications:'AWS Cloud Practitioner certified.',
    email:'divya.ai@ssscollege.edu.in', phone:'+91 99400 11503', joined:'2021' },

  /* ── Mathematics ── */
  { id:'s15', dept:'mathematics', deptName:' Mathematics',
    name:'R. SELVAKUMAR', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'M. Sc, M. Phil, B. Ed.,', exp:'17 Years',
    spec:'ALGEBRA ANALYSIS FUNCTIONAL ANALYSIS STATISTICS', photo:'R. SELVAKUMAR .jpeg',
    avatarColor:'#1a3a7a', publications:'Core Responsibilities Academic Leadership & Governance: Oversee the strategic planning, curriculum delivery, and daily operations of the Department of Mathematics to maintain high academic standards. Faculty Management & Mentorship: Guide, evaluate, and mentor faculty members, promoting professional development, research initiatives, and effective teaching methodologies. Curriculum Design & Enhancement: Modernize the mathematics syllabus by incorporating advanced topics in Algebra, Analysis, and Statistics, ensuring alignment with institutional standards and market requirements. Student Academic Progression: Monitor student performance, implement remedial measures for struggling students, and organize advanced seminars to foster analytical thinking. Resource & Workload Allocation: Manage the department annual budget, optimize faculty timetables, and allocate courses based on specialization and expertise. Examination & Evaluation Oversight: Supervise the internal assessment process, question paper setting, and timely evaluation of examinations within the department. 17 Years of Teaching Excellence: Successfully delivered advanced lectures across core mathematical domains, including Functional Analysis, Real & Complex Analysis, and Abstract Algebra, consistently achieving excellent student pass percentages. Departmental Growth & Leadership Spearheaded the departmentS growth over a long-standing tenure, enhancing student enrollment and improving overall graduation rates. Curriculum Modernization: Successfully introduced structured modules in Applied Statistics and Mathematical Modeling, bridging the gap between theoretical math and industry applications. Academic Event Organization: Chaired and successfully organized multiple regional/national seminars, workshops, and faculty development programs (FDPs) to promote mathematical research. Streamlined Digital Infrastructure: Led the transition to hybrid learning tools and digital mathematical software (such as LaTeX or MATLAB platforms) for department faculty and students. Mentorship Impact: Guided hundreds of undergraduate and postgraduate students through academic counseling, leading many toward successful careers in teaching, research, and data analytics.',
    email:'-', phone:'-', joined:'2009' },
  { id:'s16', dept:'mathematics', deptName:'Mathematics',
    name:'Mr. P. Sureshkumar', desig:'Professor', fullTitle:'Professor',
    qual:'M.Sc. (Maths), M.Phil., (Ph.D. pursuing)', exp:'14 Years',
    spec:'Calculus, Differential Equations, Linear Algebra', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#2a4a7a', publications:'6 papers in Scopus journals. SLET qualified.',
    email:'suresh.maths@ssscollege.edu.in', phone:'+91 99400 11602', joined:'2010' },
  { id:'s17', dept:'mathematics', deptName:'Mathematics',
    name:'Mrs. S. Radha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Maths), M.Phil.', exp:'9 Years',
    spec:'Statistics, Probability, Numerical Methods', photo:'staff_female_1_1783430680601.jpg',
    avatarColor:'#6a2a1a', publications:'3 papers in national conferences. NET qualified.',
    email:'radha.maths@ssscollege.edu.in', phone:'+91 99400 11603', joined:'2015' },

  /* ── B.Sc Physics ── */
  { id:'s18', dept:'bsc-chemistry', deptName:'B.Sc Physics',
    name:'Dr. T. Senthil Nathan', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'M.Sc. (Physics), M.Phil., Ph.D.', exp:'17 Years',
    spec:'Quantum Mechanics, Nuclear Physics, Optics', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#2a4a7a', publications:'12 papers in physics journals. BRNS project investigator.',
    email:'senthilnathan.physics@ssscollege.edu.in', phone:'+91 99400 11701', joined:'2007' },
  { id:'s19', dept:'bsc-chemistry', deptName:'B.Sc Physics',
    name:'Mrs. M. Kavitha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Physics), M.Phil.', exp:'10 Years',
    spec:'Electronics, Electromagnetic Theory, Solid State', photo:'staff_female_1_1783430680601.jpg',
    avatarColor:'#1a3a7a', publications:'4 papers in national journals. SET qualified.',
    email:'kavitha.physics@ssscollege.edu.in', phone:'+91 99400 11702', joined:'2014' },
  { id:'s20', dept:'bsc-chemistry', deptName:'B.Sc Physics',
    name:'Mr. G. Anand', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Physics), M.Phil.', exp:'6 Years',
    spec:'Classical Mechanics, Thermodynamics, Spectroscopy', photo:'staff_male_2_1783430692518.jpg',
    avatarColor:'#2a4a7a', publications:'2 papers in national conferences. NET qualified.',
    email:'anand.physics@ssscollege.edu.in', phone:'+91 99400 11703', joined:'2018' },

  /* ── B.Sc Chemistry ── */
  { id:'s21', dept:'bsc-chemistry', deptName:'B.Sc Chemistry',
    name:'Dr. R. Meenakshi', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'M.Sc. (Chemistry), M.Phil., Ph.D.', exp:'16 Years',
    spec:'Organic Chemistry, Medicinal Chemistry, Spectroscopy', photo:'staff_female_3_1783430743766.jpg',
    avatarColor:'#6a2a1a', publications:'10 papers in chemistry journals. UGC minor project holder.',
    email:'meenakshi.chem@ssscollege.edu.in', phone:'+91 99400 11801', joined:'2008' },
  { id:'s22', dept:'bsc-chemistry', deptName:'B.Sc Chemistry',
    name:'Mr. S. Prabhu', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Chemistry), M.Phil.', exp:'8 Years',
    spec:'Inorganic Chemistry, Analytical Chemistry, Environmental Chem', photo:'staff_male_1_1783430669817.jpg',
    avatarColor:'#2a6a4a', publications:'3 papers in national journals. SET qualified.',
    email:'prabhu.chem@ssscollege.edu.in', phone:'+91 99400 11802', joined:'2016' },
  { id:'s23', dept:'bsc-chemistry', deptName:'B.Sc Chemistry',
    name:'Mrs. L. Saranya', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Chemistry), M.Phil.', exp:'5 Years',
    spec:'Physical Chemistry, Industrial Chemistry, Lab Techniques', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#6a2a1a', publications:'1 paper in national conference. Lab safety certified.',
    email:'saranya.chem@ssscollege.edu.in', phone:'+91 99400 11803', joined:'2019' },

  /* ── B.Sc Biotechnology ── */
  { id:'s24', dept:'bsc-chemistry', deptName:'B.Sc Biotechnology',
    name:'Dr. P. Anitha Devi', desig:'HOD', fullTitle:'Head of Department & Assistant Professor',
    qual:'M.Sc. (Biotechnology), M.Phil., Ph.D.', exp:'13 Years',
    spec:'Molecular Biology, Immunology, Bioinformatics', photo:'staff_female_3_1783430743766.jpg',
    avatarColor:'#1a6a4a', publications:'9 papers in life science journals. DBT project recipient.',
    email:'anitha.biotech@ssscollege.edu.in', phone:'+91 99400 11901', joined:'2011' },
  { id:'s25', dept:'bsc-chemistry', deptName:'B.Sc Biotechnology',
    name:'Mr. R. Ganesh', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Biotechnology), M.Phil.', exp:'7 Years',
    spec:'Cell Biology, Genetics, Microbiology, Lab Techniques', photo:'staff_male_2_1783430692518.jpg',
    avatarColor:'#2a6a4a', publications:'2 papers in biotechnology conferences.',
    email:'ganesh.biotech@ssscollege.edu.in', phone:'+91 99400 11902', joined:'2017' },
  { id:'s26', dept:'bsc-chemistry', deptName:'B.Sc Biotechnology',
    name:'Mrs. D. Sangeetha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (Microbiology), M.Phil.', exp:'5 Years',
    spec:'Environmental Biotechnology, Bioprocess Engineering', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#1a6a4a', publications:'NET qualified. Published in national journal.',
    email:'sangeetha.biotech@ssscollege.edu.in', phone:'+91 99400 11903', joined:'2019' },

  /* ── B.Com ── */
  { id:'s27', dept:'bcom', deptName:'B.Com',
    name:'Mrs. M. Lakshmi', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'M.Com., M.Phil., M.Ed., MBA', exp:'16 Years',
    spec:'Financial Accounting, Corporate Accounting, Auditing', photo:'Mrs. M. Lakshmi.jpeg',
    avatarColor:'#7a5a00', publications:'Mrs. M. Lakshmi is a dedicated academician with 16 years of teaching experience in higher education. She holds postgraduate degrees in Commerce and Business Administration (M.Com. and MBA), along with M.Phil. and M.Ed., reflecting her strong academic foundation and commitment to excellence in teaching and learning. She is passionate about nurturing students through innovative teaching methods, academic mentoring, and value-based education. Her areas of interest include Commerce, Management, Accounting, Business Studies, and Educational Practices. She actively contributes to curriculum development, student guidance, and various academic and co-curricular activities within the institution. With a student-centric approach and a commitment to continuous professional development, Mrs. M. Lakshmi strives to inspire learners to achieve academic excellence and develop the skills required for their personal and professional growth..',
    email:'-', phone:' -', joined:'2010' },
  { id:'s28', dept:'bcom', deptName:'B.Com',
    name:'Mrs. S. Padmavathi', desig:'Professor', fullTitle:'Professor',
    qual:'M.Com., M.Phil., B.Ed.', exp:'14 Years',
    spec:'Business Law, Income Tax, Business Economics', photo:'staff_female_1_1783430680601.jpg',
    avatarColor:'#5a4000', publications:'5 papers in commerce education journals.',
    email:'padmavathi.bcom@ssscollege.edu.in', phone:'+91 99400 12002', joined:'2010' },
  { id:'s29', dept:'bcom', deptName:'B.Com',
    name:'Mr. N. Murugesan', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Com., M.Phil.', exp:'9 Years',
    spec:'Cost Accounting, Management Accounting, Banking', photo:'staff_male_1_1783430669817.jpg',
    avatarColor:'#7a5a00', publications:'3 papers in national conferences. SET qualified.',
    email:'murugesan.bcom@ssscollege.edu.in', phone:'+91 99400 12003', joined:'2015' },
  { id:'s30', dept:'bcom', deptName:'B.Com',
    name:'Mrs. T. Geetha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Com., M.Phil.', exp:'7 Years',
    spec:'Business Statistics, Financial Markets, Auditing', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#5a4000', publications:'2 papers in commerce journals. NET qualified.',
    email:'geetha.bcom@ssscollege.edu.in', phone:'+91 99400 12004', joined:'2017' },

  /* ── B.Com (CA) ── */
  { id:'s31', dept:'bcom-ca', deptName:'B.Com (Computer Applications)',
    name:'Mr. V. Balamurugan', desig:'HOD', fullTitle:'Head of Department & Assistant Professor',
    qual:'M.Com. (CA), MCA, M.Phil.', exp:'14 Years',
    spec:'Tally ERP, E-Commerce, Financial Accounting Software', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#5a4a00', publications:'Tally Certified Professional. 6 papers in national journals.',
    email:'balamurugan.bcoca@ssscollege.edu.in', phone:'+91 99400 12101', joined:'2010' },
  { id:'s32', dept:'bcom-ca', deptName:'B.Com (Computer Applications)',
    name:'Mrs. A. Kavitha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Com., MCA, M.Phil.', exp:'9 Years',
    spec:'MS Office, Data Entry, Business Software, ERP', photo:'staff_female_1_1783430680601.jpg',
    avatarColor:'#7a5a00', publications:'3 papers in commerce & IT journals. SET qualified.',
    email:'kavitha.bcoca@ssscollege.edu.in', phone:'+91 99400 12102', joined:'2015' },
  { id:'s33', dept:'bcom-ca', deptName:'B.Com (Computer Applications)',
    name:'Ms. R. Nithya', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Com. (CA), M.Phil.', exp:'5 Years',
    spec:'Corporate Accounting, E-Commerce, Internet Banking', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#5a4a00', publications:'1 paper in national conference. NET qualified.',
    email:'nithya.bcoca@ssscollege.edu.in', phone:'+91 99400 12103', joined:'2019' },

  /* ── B.B.A ── */
  { id:'s34', dept:'bba', deptName:'B.B.A',
    name:'Dr. C. Selvakumar', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'MBA, M.Phil., Ph.D.', exp:'15 Years',
    spec:'Strategic Management, HR Management, Entrepreneurship', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#7a2a00', publications:'10 papers in management journals. MBA mentor & career coach.',
    email:'selvakumar.bba@ssscollege.edu.in', phone:'+91 99400 12201', joined:'2009' },
  { id:'s35', dept:'bba', deptName:'B.B.A',
    name:'Mrs. K. Malathi', desig:'Professor', fullTitle:'Professor',
    qual:'MBA, M.Phil., (Ph.D. pursuing)', exp:'12 Years',
    spec:'Marketing Management, Consumer Behavior, Advertising', photo:'staff_female_1_1783430680601.jpg',
    avatarColor:'#5a2000', publications:'5 papers in management journals. SET qualified.',
    email:'malathi.bba@ssscollege.edu.in', phone:'+91 99400 12202', joined:'2012' },
  { id:'s36', dept:'bba', deptName:'B.B.A',
    name:'Mr. T. Dinesh', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'MBA, M.Phil.', exp:'7 Years',
    spec:'Financial Management, Business Communication, OB', photo:'staff_male_2_1783430692518.jpg',
    avatarColor:'#7a2a00', publications:'2 papers in national management conferences.',
    email:'dinesh.bba@ssscollege.edu.in', phone:'+91 99400 12203', joined:'2017' },

  /* ── B.A. Tamil ── */
  { id:'s37', dept:'ba-tamil', deptName:'B.A. Tamil',
    name:'Dr. S. Venkatesan', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'M.A. (Tamil), M.Phil., Ph.D.', exp:'22 Years',
    spec:'Classical Tamil, Sangam Literature, Tamil Grammar', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#8a1a1a', publications:'18 research papers. Author of 3 Tamil literary books. TVU BOS member.',
    email:'venkatesan.tamil@ssscollege.edu.in', phone:'+91 99400 12301', joined:'2003' },
  { id:'s38', dept:'ba-tamil', deptName:'B.A. Tamil',
    name:'Mrs. P. Kalaiyarasi', desig:'Professor', fullTitle:'Professor',
    qual:'M.A. (Tamil), M.Phil., B.Ed.', exp:'15 Years',
    spec:'Tamil Poetry, Modern Tamil Prose, Drama', photo:'staff_female_1_1783430680601.jpg',
    avatarColor:'#5a0a0a', publications:'7 papers in Tamil linguistics journals.',
    email:'kalaiyarasi.tamil@ssscollege.edu.in', phone:'+91 99400 12302', joined:'2009' },
  { id:'s39', dept:'ba-tamil', deptName:'B.A. Tamil',
    name:'Mr. M. Anbarasan', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.A. (Tamil), M.Phil.', exp:'8 Years',
    spec:'Comparative Literature, Translation Studies, Linguistics', photo:'staff_male_1_1783430669817.jpg',
    avatarColor:'#8a1a1a', publications:'3 papers in Tamil and comparative literature journals.',
    email:'anbarasan.tamil@ssscollege.edu.in', phone:'+91 99400 12303', joined:'2016' },

  /* ── B.A. English ── */
  { id:'s40', dept:'english', deptName:'English',
    name:'-', desig:'HOD', fullTitle:'Head of Department & Associate Professor',
    qual:'+', exp:'18 Years',
    spec:'-', photo:'staff_female_3_1783430743766.jpg',
    avatarColor:'#2a5a7a', publications:'-------',
    email:'+++', phone:'///', joined:'****' },
  { id:'s41', dept:'english', deptName:'B.A. English',
    name:'Mr. R. Srinivasan', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.A. (English), M.Phil.', exp:'10 Years',
    spec:'American Literature, Creative Writing, Communication', photo:'staff_male_1_1783430669817.jpg',
    avatarColor:'#1a3a5a', publications:'4 papers in English language teaching journals.',
    email:'srinivasan.english@ssscollege.edu.in', phone:'+91 99400 12402', joined:'2014' },
  { id:'s42', dept:'english', deptName:'B.A. English',
    name:'Mrs. V. Radhika', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.A. (English), M.Phil.', exp:'6 Years',
    spec:'Phonetics, World Literature, Soft Skills', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#2a5a7a', publications:'2 papers in national English language conferences.',
    email:'radhika.english@ssscollege.edu.in', phone:'+91 99400 12403', joined:'2018' },

  /* ── B.A. Defence Studies ── */
  { id:'s43', dept:'ba-defence', deptName:'B.A. Defence Studies',
    name:'Major (Retd.) K. Palaniappan', desig:'HOD', fullTitle:'Head of Department & Assistant Professor',
    qual:'M.A. (Defence Studies), (Ph.D. pursuing)', exp:'16 Years',
    spec:'Military History, Strategic Studies, NCC, Physical Training', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#2a5a2a', publications:'Retired Major (Indian Army). Author of tactical studies module.',
    email:'palaniappan.defence@ssscollege.edu.in', phone:'+91 99400 12501', joined:'2010' },
  { id:'s44', dept:'ba-defence', deptName:'B.A. Defence Studies',
    name:'Mr. S. Muthukrishnan', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.A. (Political Science), M.Phil.', exp:'9 Years',
    spec:'International Relations, Counter-Terrorism, Geopolitics', photo:'staff_male_1_1783430669817.jpg',
    avatarColor:'#1a3a1a', publications:'4 papers in defence and strategic studies journals.',
    email:'muthukrishnan.defence@ssscollege.edu.in', phone:'+91 99400 12502', joined:'2015' },
  { id:'s45', dept:'ba-defence', deptName:'B.A. Defence Studies',
    name:'Mrs. K. Bharathi', desig:'Assistant Professor', fullTitle:'Physical Training Instructor',
    qual:'M.P.Ed., M.Phil.', exp:'8 Years',
    spec:'Physical Training, Sports, NCC, Yoga', photo:'staff_female_1_1783430680601.jpg',
    avatarColor:'#2a5a2a', publications:'NCC officer. State-level sports coach.',
    email:'bharathi.defence@ssscollege.edu.in', phone:'+91 99400 12503', joined:'2016' },

  /* ── M.Sc CS ── */
  { id:'s46', dept:'msc-cs', deptName:'M.Sc Computer Science',
    name:'Dr. B. Sivasubramanian', desig:'HOD', fullTitle:'Head of Department & Professor',
    qual:'M.Sc. (CS), M.Phil., Ph.D.', exp:'21 Years',
    spec:'Cloud Computing, Distributed Systems, Cyber Security', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#1a3a7a', publications:'19 papers in Scopus/WoS journals. 2 patents filed. TVU BOS Member.',
    email:'sivasubramanian.msccs@ssscollege.edu.in', phone:'+91 99400 12601', joined:'2004' },
  { id:'s47', dept:'msc-cs', deptName:'M.Sc Computer Science',
    name:'Dr. N. Sangeetha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (CS), M.Phil., Ph.D.', exp:'11 Years',
    spec:'Advanced Algorithms, Artificial Intelligence, Research Methods', photo:'staff_female_3_1783430743766.jpg',
    avatarColor:'#0a1a5a', publications:'8 papers in AI/algorithm journals. NET qualified.',
    email:'sangeetha.msccs@ssscollege.edu.in', phone:'+91 99400 12602', joined:'2013' },
  { id:'s48', dept:'msc-cs', deptName:'M.Sc Computer Science',
    name:'Mr. A. Vignesh', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Sc. (CS), M.Phil.', exp:'7 Years',
    spec:'Software Architecture, Big Data, Advanced Java', photo:'staff_male_2_1783430692518.jpg',
    avatarColor:'#1a3a7a', publications:'3 papers in software engineering conferences. AWS certified.',
    email:'vignesh.msccs@ssscollege.edu.in', phone:'+91 99400 12603', joined:'2017' },

  /* ── M.Com ── */
  { id:'s49', dept:'mcom', deptName:'M.Com',
    name:'Dr. L. Radhakrishnan', desig:'HOD', fullTitle:'Head of Department & Professor',
    qual:'M.Com., M.Phil., Ph.D., PGDM', exp:'20 Years',
    spec:'Advanced Financial Accounting, Corporate Finance, Research', photo:'staff_male_3_1783430730751.jpg',
    avatarColor:'#5a4a00', publications:'15 papers in commerce and finance journals. TVU academic council member.',
    email:'radhakrishnan.mcom@ssscollege.edu.in', phone:'+91 99400 12701', joined:'2005' },
  { id:'s50', dept:'mcom', deptName:'M.Com',
    name:'Dr. S. Vasantha', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Com., M.Phil., Ph.D.', exp:'12 Years',
    spec:'International Trade, Tax Planning, Financial Markets', photo:'staff_female_3_1783430743766.jpg',
    avatarColor:'#3a2a00', publications:'7 papers in finance and trade journals. NET qualified.',
    email:'vasantha.mcom@ssscollege.edu.in', phone:'+91 99400 12702', joined:'2012' },
  { id:'s51', dept:'mcom', deptName:'M.Com',
    name:'Mr. P. Kumaresan', desig:'Assistant Professor', fullTitle:'Assistant Professor',
    qual:'M.Com., MBA, M.Phil.', exp:'8 Years',
    spec:'Banking Theory, Business Ethics, Securities Analysis', photo:'staff_male_1_1783430669817.jpg',
    avatarColor:'#5a4a00', publications:'3 papers in banking and commerce journals.',
    email:'kumaresan.mcom@ssscollege.edu.in', phone:'+91 99400 12703', joined:'2016' },
  /* Extra staff to reach 52+ */
  { id:'s52', dept:'mathematics', deptName:'Mathematics',
    name:'Ms. T. Hemamalini', desig:'Guest Faculty', fullTitle:'Guest Faculty',
    qual:'M.Sc. (Maths), M.Phil.', exp:'2 Years',
    spec:'Mechanics, Operations Research', photo:'staff_female_2_1783430718315.jpg',
    avatarColor:'#1a3a7a', publications:'Part-time guest lecturer.',
    email:'hema.maths@ssscollege.edu.in', phone:'+91 99400 11604', joined:'2022' }
];

/* ─────────────────────────────────────────────────────────
   DEPARTMENT DATA
───────────────────────────────────────────────────────── */
const DEPARTMENTS = [
  { id:'bsc-cs', name:'B.Sc Computer Science', short:'B.Sc CS', type:'science', degree:'UG', years:3, semesters:6, icon:'💻', fee:'₹14,500', intake:60, gradient:'linear-gradient(135deg,#1a5a9a,#0d3a6e)', desc:'Core computer science covering programming, data structures, algorithms, OS, networks and software engineering.', subjects:['C Programming','Data Structures','Java Programming','Database Systems','Operating Systems','Computer Networks','Software Engineering','Web Technologies','Python Programming','Microprocessors'], careers:['Software Developer','Systems Analyst','Database Admin','IT Consultant','Web Developer'], regulation:'2019' },
  { id:'bca', name:'Bachelor of Computer Applications', short:'B.C.A', type:'science', degree:'UG', years:3, semesters:6, icon:'🖥️', fee:'₹15,000', intake:60, gradient:'linear-gradient(135deg,#2a6a4a,#1a4a2a)', desc:'Application-oriented computing covering programming, web dev, DBMS and software application development.', subjects:['C Programming','Data Structures','Java','HTML & CSS','DBMS','Operating Systems','PHP & MySQL','Visual Basic','Computer Networks','Software Testing'], careers:['Application Developer','Web Designer','DBA','System Admin','IT Support'], regulation:'2019' },
  { id:'bsc-data-science', name:'B.Sc Data Science', short:'B.Sc DS', type:'science', degree:'UG', years:3, semesters:6, icon:'📊', fee:'₹13,000', intake:40, gradient:'linear-gradient(135deg,#5a1a8a,#3a0a5a)', desc:'Modern data science with Python, statistics, machine learning, big data and data visualization.', subjects:['Python Programming','Statistics','Machine Learning','Data Visualization','Big Data Analytics','R Programming','Deep Learning','Business Intelligence','Database Management','Data Mining'], careers:['Data Analyst','Data Scientist','ML Engineer','Business Analyst','Data Engineer'], regulation:'2023' },
  { id:'bsc-ai', name:'B.Sc Artificial Intelligence', short:'B.Sc AI', type:'science', degree:'UG', years:3, semesters:6, icon:'🤖', fee:'₹15,000', intake:40, gradient:'linear-gradient(135deg,#8a3a00,#5a2000)', desc:'Cutting-edge AI programme covering machine learning, neural networks, NLP, computer vision and robotics.', subjects:['Introduction to AI','Python for AI','Machine Learning','Deep Learning','NLP','Computer Vision','Robotics','Expert Systems','Ethics in AI','Cloud Computing'], careers:['AI Engineer','ML Researcher','NLP Specialist','Computer Vision Engineer','AI Consultant'], regulation:'2023' },
  { id:'mathematics', name:'Mathematics', short:'Maths', type:'science', degree:'UG', years:3, semesters:6, icon:'📐', fee:'-', intake:60, gradient:'linear-gradient(135deg,#1a3a7a,#0a2a5a)', desc:'Classical mathematics with algebra, calculus, real analysis, numerical methods and statistics.', subjects:['Algebra','Calculus','Real Analysis','Complex Analysis','Differential Equations','Number Theory','Statistics','Numerical Methods','Linear Algebra','Mechanics'], careers:['Mathematician','Statistician','Actuary','Data Analyst','Research Scientist','Teacher'], regulation:'2019' },
  { id:'english', name:'English', short:'English', type:'arts', degree:'UG', years:3, semesters:6, icon:'📝', fee:'-', intake:60, gradient:'linear-gradient(135deg,#2a5a7a,#1a3a5a)', desc:'English language and literature covering British, American and World literature, linguistics and creative writing.', subjects:['British Literature','American Literature','World Literature','Linguistics','Phonetics','Creative Writing','Literary Criticism','Drama Studies','Post-colonial Literature','Communication Skills'], careers:['English Teacher','Content Writer','Journalist','Translator','IELTS Trainer','Publishing'], regulation:'2019' },
  { id:'bsc-chemistry', name:'B.Sc Chemistry', short:'B.Sc Chemistry', type:'science', degree:'UG', years:3, semesters:6, icon:'🧪', fee:'₹11,000', intake:60, gradient:'linear-gradient(135deg,#6a2a1a,#4a1a0a)', desc:'Core chemistry covering organic, inorganic, physical and analytical chemistry with extensive laboratory work.', subjects:['Organic Chemistry','Inorganic Chemistry','Physical Chemistry','Analytical Chemistry','Biochemistry','Spectroscopy','Environmental Chemistry','Industrial Chemistry','Polymer Chemistry','Medicinal Chemistry'], careers:['Chemist','Research Scientist','Lab Analyst','Quality Control','Pharma Industry'], regulation:'2019' },
  { id:'bcom', name:'Bachelor of Commerce', short:'B.Com', type:'commerce', degree:'UG', years:3, semesters:6, icon:'💰', fee:'₹10,000', intake:60, gradient:'linear-gradient(135deg,#7a5a00,#5a4000)', desc:'Comprehensive commerce education in accounting, economics, business law, taxation and management.', subjects:['Financial Accounting','Business Economics','Corporate Accounting','Business Law','Income Tax','Cost Accounting','Business Statistics','Management Accounting','Auditing','Banking & Insurance'], careers:['Accountant','Auditor','Tax Consultant','Bank Officer','Financial Analyst','CA/CMA aspirant'], regulation:'2019' },
  { id:'bcom-ca', name:'B.Com (Computer Applications)', short:'B.Com CA', type:'commerce', degree:'UG', years:3, semesters:6, icon:'💹', fee:'₹12,500', intake:60, gradient:'linear-gradient(135deg,#5a4a00,#3a2a00)', desc:'Commerce with computer applications — Tally, MS Office, e-Commerce and financial IT systems.', subjects:['Financial Accounting','Tally ERP 9','Business Economics','Corporate Accounting','E-Commerce','MS Office','Income Tax','Cost Accounting','Business Software','Data Entry'], careers:['Accountant','Tally Operator','E-Commerce Specialist','Financial Analyst','Bank Clerk'], regulation:'2019' },
  { id:'bba', name:'Bachelor of Business Administration', short:'B.B.A', type:'commerce', degree:'UG', years:3, semesters:6, icon:'📈', fee:'₹12,000', intake:60, gradient:'linear-gradient(135deg,#7a2a00,#5a1a00)', desc:'Business administration with management theory, HR, marketing, finance, entrepreneurship and OB.', subjects:['Principles of Management','Human Resource Management','Marketing Management','Financial Management','Business Communication','Entrepreneurship','Organizational Behavior','Business Law','Operations Management','Strategic Management'], careers:['Business Manager','HR Executive','Marketing Manager','Entrepreneur','MBA candidate','Bank PO'], regulation:'2019' },
  { id:'ba-tamil', name:'B.A. Tamil', short:'B.A. Tamil', type:'arts', degree:'UG', years:3, semesters:6, icon:'📜', fee:'₹8,000', intake:60, gradient:'linear-gradient(135deg,#8a1a1a,#5a0a0a)', desc:'Tamil language, literature and culture — classical Sangam literature to modern Tamil prose and poetry.', subjects:['Classical Tamil Literature','Sangam Literature','Tamil Grammar','Modern Tamil Prose','Tamil Poetry','Tamil Drama','Linguistics','Translation Studies','Tamil Culture','Comparative Literature'], careers:['Tamil Teacher','Journalist','Translator','Government Services','Author','Lecturer'], regulation:'2019' },
  { id:'ba-defence', name:'B.A. Defence Studies', short:'B.A. Defence', type:'arts', degree:'UG', years:3, semesters:6, icon:'🛡️', fee:'₹9,000', intake:40, gradient:'linear-gradient(135deg,#2a5a2a,#1a3a1a)', desc:'Defence and strategic studies for aspiring military professionals — NCC, physical training, defence history and strategy.', subjects:['National Security Studies','Military History','Strategic Studies','International Relations','Defence Economy','Geopolitics','Counter-Terrorism','NCC Training','Physical Training','Defence Law'], careers:['Indian Army/Navy/Air Force','CRPF/BSF/CISF','State Police','NCC Officer','Defence Ministry'], regulation:'2019' },
  { id:'msc-cs', name:'M.Sc Computer Science', short:'M.Sc CS', type:'pg', degree:'PG', years:2, semesters:4, icon:'🎓', fee:'₹18,000', intake:30, gradient:'linear-gradient(135deg,#1a3a7a,#0a1a5a)', desc:'Advanced postgraduate computer science — algorithms, advanced DBMS, cloud computing, AI and research methodology.', subjects:['Advanced Algorithms','Advanced DBMS','Cloud Computing','Artificial Intelligence','Research Methodology','Advanced Java','Software Architecture','Distributed Systems','Big Data','Cyber Security'], careers:['Software Architect','Research Scientist','IT Manager','University Lecturer','System Designer','Cloud Architect'], regulation:'2019' },
  { id:'mcom', name:'Master of Commerce', short:'M.Com', type:'pg', degree:'PG', years:2, semesters:4, icon:'📊', fee:'₹16,000', intake:30, gradient:'linear-gradient(135deg,#5a4a00,#3a2a00)', desc:'Advanced commerce and management in corporate finance, international trade, research and advanced accounting.', subjects:['Advanced Financial Accounting','Corporate Finance','International Trade','Research Methodology','Advanced Cost Accounting','Security Analysis','Banking Theory','Tax Planning','Business Ethics','Financial Markets'], careers:['Senior Accountant','Finance Manager','Research Analyst','Lecturer','CA/CMA aspirant','CFO path'], regulation:'2019' },

];

/* ─── Companies & Testimonials ───────────────────────────── */
const COMPANIES = [
  {icon:'🔵',name:'MRF',sector:'MRF'},{icon:'🚗',name:'TVS Motors',sector:'Mfg'}
];
const TESTIMONIALS = [
  {initials:'VK',name:'KARTHIK RAJ',batch:'B.Sc CS, 2022',company:'TCS – ₹5.6 LPA',text:'SSS College gave me a strong foundation in core CS. The placement cell guided me well and helped me crack TCS through the campus drive.'},
  {initials:'VK',name:'VANITHA',batch:'B.Com, 2023',company:'HDFC Bank – ₹3.2 LPA',text:'The faculty are very supportive. Tally and accounting practice helped me land a banking job. I am proud to be from SSS College.'},
  {initials:'VK',name:'DEPU',batch:'B.C.A, 2022',company:'Cognizant – ₹4.1 LPA',text:'Regular placement training, mock interviews and aptitude practice really helped me perform well at the Cognizant drive.'},
  {initials:'AJ',name:'AJAY',batch:'B.B.A, 2023',company:'Amazon – ₹3.8 LPA',text:'The BBA programme with strong management subjects gave me knowledge and confidence to join Amazon. Thank you SSS College!'},
  {initials:'VJ',name:'JAYADURGA',batch:'B.Sc Data Science, 2024',company:'Infosys – ₹4.5 LPA',text:'Data Science at SSS was exactly what I needed. Python, ML and visualization helped me ace the InfyTQ certification.'},
  {initials:'VK',name:'KARTHIK',batch:'M.Sc CS, 2024',company:'HCL – ₹6.2 LPA',text:'The PG programme gave me deep knowledge in advanced algorithms and system design. Got placed at HCL with the highest package!'}
];

/* ─── Q-Papers ───────────────────────────────────────────── */
const QUESTION_PAPERS = [
  {dept:'bsc-cs',deptName:'B.Sc Computer Science',subject:'Data Structures',code:'19UCS302',year:'2024',month:'Apr/May',sem:'III',degree:'UG',reg:'2019'},
  {dept:'bsc-cs',deptName:'B.Sc Computer Science',subject:'Database Management Systems',code:'19UCS401',year:'2024',month:'Apr/May',sem:'IV',degree:'UG',reg:'2019'},
  {dept:'bsc-cs',deptName:'B.Sc Computer Science',subject:'Operating Systems',code:'19UCS403',year:'2023',month:'Nov/Dec',sem:'IV',degree:'UG',reg:'2019'},
  {dept:'bsc-cs',deptName:'B.Sc Computer Science',subject:'Java Programming',code:'19UCS501',year:'2023',month:'Apr/May',sem:'V',degree:'UG',reg:'2019'},
  {dept:'bsc-cs',deptName:'B.Sc Computer Science',subject:'Computer Networks',code:'19UCS502',year:'2022',month:'Nov/Dec',sem:'V',degree:'UG',reg:'2019'},
  {dept:'bca',deptName:'B.C.A',subject:'C Programming',code:'19UCA101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'bca',deptName:'B.C.A',subject:'HTML and CSS',code:'19UCA301',year:'2024',month:'Apr/May',sem:'III',degree:'UG',reg:'2019'},
  {dept:'bca',deptName:'B.C.A',subject:'PHP and MySQL',code:'19UCA401',year:'2023',month:'Nov/Dec',sem:'IV',degree:'UG',reg:'2019'},
  {dept:'bsc-data-science',deptName:'B.Sc Data Science',subject:'Python Programming',code:'23UDS101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2023'},
  {dept:'bsc-data-science',deptName:'B.Sc Data Science',subject:'Machine Learning',code:'23UDS301',year:'2024',month:'Apr/May',sem:'III',degree:'UG',reg:'2023'},
  {dept:'bsc-ai',deptName:'B.Sc Artificial Intelligence',subject:'Introduction to AI',code:'23UAI101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2023'},
  {dept:'bsc-mathematics',deptName:'B.Sc Mathematics',subject:'Calculus',code:'19UMA101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'bsc-mathematics',deptName:'B.Sc Mathematics',subject:'Real Analysis',code:'19UMA301',year:'2024',month:'Apr/May',sem:'III',degree:'UG',reg:'2019'},
  {dept:'bsc-physics',deptName:'B.Sc Physics',subject:'Classical Mechanics',code:'19UPH101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'bsc-physics',deptName:'B.Sc Physics',subject:'Quantum Mechanics',code:'19UPH501',year:'2023',month:'Apr/May',sem:'V',degree:'UG',reg:'2019'},
  {dept:'bsc-chemistry',deptName:'B.Sc Chemistry',subject:'Organic Chemistry I',code:'19UCH101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'bsc-chemistry',deptName:'B.Sc Chemistry',subject:'Inorganic Chemistry',code:'19UCH201',year:'2024',month:'Apr/May',sem:'II',degree:'UG',reg:'2019'},
  {dept:'bsc-biotech',deptName:'B.Sc Biotechnology',subject:'Cell Biology & Genetics',code:'19UBT101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'bcom',deptName:'B.Com',subject:'Financial Accounting',code:'19UCO101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'bcom',deptName:'B.Com',subject:'Corporate Accounting',code:'19UCO301',year:'2024',month:'Apr/May',sem:'III',degree:'UG',reg:'2019'},
  {dept:'bcom',deptName:'B.Com',subject:'Income Tax',code:'19UCO401',year:'2023',month:'Nov/Dec',sem:'IV',degree:'UG',reg:'2019'},
  {dept:'bcom-ca',deptName:'B.Com (CA)',subject:'Tally ERP 9',code:'19UCCA301',year:'2024',month:'Apr/May',sem:'III',degree:'UG',reg:'2019'},
  {dept:'bba',deptName:'B.B.A',subject:'Principles of Management',code:'19UBA101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'bba',deptName:'B.B.A',subject:'Marketing Management',code:'19UBA301',year:'2024',month:'Apr/May',sem:'III',degree:'UG',reg:'2019'},
  {dept:'ba-tamil',deptName:'B.A. Tamil',subject:'Classical Tamil Literature',code:'19UTA101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'ba-english',deptName:'B.A. English',subject:'British Literature I',code:'19UEN101',year:'2024',month:'Nov/Dec',sem:'I',degree:'UG',reg:'2019'},
  {dept:'msc-cs',deptName:'M.Sc Computer Science',subject:'Advanced Algorithms',code:'19PMCS101',year:'2024',month:'Nov/Dec',sem:'I',degree:'PG',reg:'2019'},
  {dept:'msc-cs',deptName:'M.Sc Computer Science',subject:'Cloud Computing',code:'19PMCS301',year:'2024',month:'Apr/May',sem:'III',degree:'PG',reg:'2019'},
  {dept:'mcom',deptName:'M.Com',subject:'Advanced Financial Accounting',code:'19PMCO101',year:'2024',month:'Nov/Dec',sem:'I',degree:'PG',reg:'2019'}
];
const TVU_QP_URL = 'https://www.tvu.edu.in/examination/previous-question-papers/';

/* ─── Legacy demo arrays — no longer used for login (now backed by
   the real database via API_BASE). Kept only for reference. ──── */
const STUDENTS = [
  {rollNo:'SSS001',password:'student123',name:'Ranjith Kumar S',dept:'B.Sc Computer Science, III Year'},
  {rollNo:'SSS002',password:'student123',name:'Priya Venkatesh',dept:'B.Com, II Year'},
  {rollNo:'SSS003',password:'pass123',name:'Saravanan K',dept:'B.C.A, III Year'}
];
/* ─────────────────────────────────────────────────────────
   STAFF LOGIN ACCOUNTS
   Each entry: id, password, name, role, dept, photo
   Default password: staff123  (staff can note their own ID)
───────────────────────────────────────────────────────── */
const STAFF_USERS = [
  /* ── Computer Science ── */
  {id:'STAFF001',password:'staff123',name:'Dr. S. Amutha',         role:'HOD – Computer Science',      dept:'bsc-cs',           photo:'staff_female_3_1783430743766.jpg'},
  {id:'STAFF002',password:'staff456',name:'Mr. R. Karthikeyan',    role:'Asst. Prof – Computer Science',dept:'bsc-cs',           photo:'staff_male_2_1783430692518.jpg'},
  {id:'STAFF003',password:'staff456',name:'Ms. P. Lavanya',        role:'Asst. Prof – Computer Science',dept:'bsc-cs',           photo:'staff_female_1_1783430680601.jpg'},
  /* ── BCA ── */
  {id:'STAFF004',password:'staff456',name:'Mr. K. Rajendran',      role:'HOD – BCA',                   dept:'bca',              photo:'staff_male_1_1783430669817.jpg'},
  {id:'STAFF005',password:'staff456',name:'Ms. R. Sangeetha',      role:'Asst. Prof – BCA',             dept:'bca',              photo:'staff_female_2_1783430718315.jpg'},
  /* ── Data Science ── */
  {id:'STAFF006',password:'staff456',name:'Dr. M. Priya',          role:'HOD – Data Science',           dept:'bsc-data-science', photo:'staff_female_3_1783430743766.jpg'},
  {id:'STAFF007',password:'staff456',name:'Mr. V. Anand',          role:'Asst. Prof – Data Science',    dept:'bsc-data-science', photo:'staff_male_3_1783430730751.jpg'},
  /* ── AI ── */
  {id:'STAFF008',password:'staff456',name:'Mr. S. Deepak',         role:'HOD – Artificial Intelligence',dept:'bsc-ai',           photo:'staff_male_2_1783430692518.jpg'},
  /* ── Mathematics ── */
  {id:'STAFF009',password:'staff456',name:'Dr. N. Vijayalakshmi',  role:'HOD – Mathematics',            dept:'bsc-mathematics',  photo:'staff_female_1_1783430680601.jpg'},
  {id:'STAFF010',password:'staff456',name:'Mr. G. Suresh',         role:'Asst. Prof – Mathematics',     dept:'bsc-mathematics',  photo:'staff_male_1_1783430669817.jpg'},
  /* ── Physics ── */
  {id:'STAFF011',password:'staff456',name:'Dr. A. Kannan',         role:'HOD – Physics',                dept:'bsc-physics',      photo:'staff_male_3_1783430730751.jpg'},
  {id:'STAFF012',password:'staff456',name:'Ms. S. Meena',          role:'Asst. Prof – Physics',         dept:'bsc-physics',      photo:'staff_female_2_1783430718315.jpg'},
  /* ── Chemistry ── */
  {id:'STAFF013',password:'staff456',name:'Dr. R. Selvi',          role:'HOD – Chemistry',              dept:'bsc-chemistry',    photo:'staff_female_3_1783430743766.jpg'},
  {id:'STAFF014',password:'staff456',name:'Mr. T. Murugan',        role:'Asst. Prof – Chemistry',       dept:'bsc-chemistry',    photo:'staff_male_2_1783430692518.jpg'},
  /* ── Biotechnology ── */
  {id:'STAFF015',password:'staff456',name:'Dr. K. Bharathi',       role:'HOD – Biotechnology',          dept:'bsc-biotech',      photo:'staff_female_1_1783430680601.jpg'},
  /* ── Commerce ── */
  {id:'STAFF016',password:'staff123',name:'Dr. K. Ramesh',         role:'HOD – Commerce',               dept:'bcom',             photo:'staff_male_1_1783430669817.jpg'},
  {id:'STAFF017',password:'staff456',name:'Ms. M. Kavitha',        role:'Asst. Prof – Commerce',        dept:'bcom',             photo:'staff_female_2_1783430718315.jpg'},
  /* ── B.Com CA ── */
  {id:'STAFF018',password:'staff456',name:'Mr. P. Venkatesh',      role:'HOD – B.Com (CA)',             dept:'bcom-ca',          photo:'staff_male_3_1783430730751.jpg'},
  /* ── BBA ── */
  {id:'STAFF019',password:'staff456',name:'Mrs. K. Malathi',       role:'HOD – BBA',                   dept:'bba',              photo:'staff_female_3_1783430743766.jpg'},
  {id:'STAFF020',password:'staff456',name:'Mr. S. Rajkumar',       role:'Asst. Prof – BBA',             dept:'bba',              photo:'staff_male_2_1783430692518.jpg'},
  /* ── Tamil ── */
  {id:'STAFF021',password:'staff456',name:'Dr. P. Selvarani',      role:'HOD – Tamil',                  dept:'ba-tamil',         photo:'staff_female_1_1783430680601.jpg'},
  {id:'STAFF022',password:'staff456',name:'Mr. K. Murugesan',      role:'Asst. Prof – Tamil',            dept:'ba-tamil',         photo:'staff_male_1_1783430669817.jpg'},
  /* ── English ── */
  {id:'STAFF023',password:'staff456',name:'Mrs. R. Subha',         role:'HOD – English',                dept:'ba-english',       photo:'staff_female_2_1783430718315.jpg'},
  {id:'STAFF024',password:'staff456',name:'Mr. A. Prakash',        role:'Asst. Prof – English',         dept:'ba-english',       photo:'staff_male_3_1783430730751.jpg'},
  /* ── Defence Studies ── */
  {id:'STAFF025',password:'staff456',name:'Maj. R. Sundar (Retd)', role:'HOD – Defence Studies',        dept:'ba-defence',       photo:'staff_male_1_1783430669817.jpg'},
  /* ── M.Sc CS ── */
  {id:'STAFF026',password:'staff456',name:'Dr. V. Jeyalakshmi',    role:'HOD – M.Sc Computer Science',  dept:'msc-cs',           photo:'staff_female_3_1783430743766.jpg'},
  {id:'STAFF027',password:'staff456',name:'Mr. C. Arun',           role:'Asst. Prof – M.Sc CS',         dept:'msc-cs',           photo:'staff_male_2_1783430692518.jpg'},
  /* ── M.Com ── */
  {id:'STAFF028',password:'staff456',name:'Dr. S. Padmavathi',     role:'HOD – M.Com',                  dept:'mcom',             photo:'staff_female_1_1783430680601.jpg'},
  /* ── Admin ── */
  {id:'ADMIN001',password:'admin123',name:'Mr. A. Rajan',          role:'College Administrator',         dept:'admin',            photo:'staff_male_3_1783430730751.jpg'}
];

/* ═════════════════════════════════════════════════════════
   ROUTING
═════════════════════════════════════════════════════════ */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onPageShown(pageId);
  }
}
function onPageShown(id) {
  switch(id) {
    case 'home':      renderHomeDeptGrid(); renderCompanyLogos(); break;
    case 'courses':   renderFullDeptGrid(); break;
    case 'faculty':   renderFacultyPage(); break;
    case 'placements':renderPlacements(); break;
    case 'qpapers':   renderQPapers(); break;
    case 'admissions':   renderFeesTable(); break;
    case 'class-notes':  setTimeout(function(){ filterPdfNotes(); var nb=document.getElementById('cnNotice'); if(nb) nb.style.display='flex'; }, 50); break;
    case 'gallery':   setTimeout(initGallery3D, 50); break;
    case 'staff-dashboard': if(typeof switchStaffTab==='function') switchStaffTab('notes'); break;
  }
}

/* ═════════════════════════════════════════════════════════
   HERO SLIDER
═════════════════════════════════════════════════════════ */
let currentSlide = 0;
let sliderTimer = null;
function goSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('#heroSliderDots .dot');
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d  => d.classList.remove('active'));
  currentSlide = (n + slides.length) % slides.length;
  if (slides[currentSlide]) slides[currentSlide].classList.add('active');
  if (dots[currentSlide])   dots[currentSlide].classList.add('active');
}
function startSlider() {
  sliderTimer = setInterval(() => goSlide(currentSlide + 1), 4000);
}

/* ═════════════════════════════════════════════════════════
   DEPARTMENT CARD
═════════════════════════════════════════════════════════ */
function deptCardHTML(d) {
  return `<div class="dept-card" data-type="${d.type}" data-degree="${d.degree}" onclick="showDept('${d.id}')">
    <div class="dept-card-header" style="background:${d.gradient}">
      <div class="dept-icon">${d.icon}</div>
      <div>
        <div class="dept-name">${d.name}</div>
        <span class="dept-tag">${d.degree} · ${d.years} Years</span>
      </div>
    </div>
    <div class="dept-card-body">
      <p class="dept-desc">${d.desc.substring(0,100)}…</p>
      <div class="dept-fee">
        <span class="dept-fee-label">Semester Fee</span>
        <span class="dept-fee-amount">${d.fee}</span>
      </div>
      <div class="dept-explore">View Details & Faculty →</div>
    </div>
  </div>`;
}
function renderHomeDeptGrid() {
  const g = document.getElementById('homeDeptGrid');
  if (!g || g.dataset.rendered) return;
  g.innerHTML = DEPARTMENTS.map(deptCardHTML).join('');
  g.dataset.rendered = '1';
}
function renderFullDeptGrid() {
  const g = document.getElementById('fullDeptGrid');
  if (!g || g.dataset.rendered) return;
  g.innerHTML = DEPARTMENTS.map(deptCardHTML).join('');
  g.dataset.rendered = '1';
}
function filterDepts(type, btn) {
  btn.closest('.dept-tabs').querySelectorAll('.dept-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const g = document.getElementById('homeDeptGrid');
  if (!g) return;
  g.querySelectorAll('.dept-card').forEach(c => {
    c.style.display = (type==='all'||c.dataset.type===type||(type==='pg'&&c.dataset.degree==='PG'))?'':'none';
  });
}
function filterCourseDepts(type, btn) {
  btn.closest('.dept-tabs').querySelectorAll('.dept-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const g = document.getElementById('fullDeptGrid');
  if (!g) return;
  g.querySelectorAll('.dept-card').forEach(c => {
    c.style.display = (type==='all'||c.dataset.type===type||(type==='pg'&&c.dataset.degree==='PG'))?'':'none';
  });
}

/* ═════════════════════════════════════════════════════════
   STAFF PHOTO HELPER
═════════════════════════════════════════════════════════ */
function staffPhotoHTML(s, size=80) {
  return `<div class="staff-photo-wrap" style="width:${size}px;height:${size}px;">
    <img src="${STAF}${s.photo}" alt="${s.name}"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
    <div class="staff-avatar-fallback" style="display:none;background:${s.avatarColor};">
      ${s.name.split(' ').map(w=>w[0]).join('').substring(0,2)}
    </div>
  </div>`;
}

/* ═════════════════════════════════════════════════════════
   DEPARTMENT DETAIL PAGE  (includes staff section)
═════════════════════════════════════════════════════════ */
function showDept(deptId) {
  const d = DEPARTMENTS.find(x => x.id === deptId);
  if (!d) { showPage('courses'); return; }
  const deptStaff = STAFF_DATA.filter(s => s.dept === deptId);
  const staffHTML = deptStaff.map(s => `
    <div class="dept-staff-card" onclick="openStaffModal('${s.id}')">
      <div class="dept-staff-card-top">
        ${staffPhotoHTML(s, 90)}
      </div>
      <div class="dept-staff-card-body">
        ${s.desig==='HOD'?`<div class="dept-staff-hod-badge">⭐ HOD</div>`:``}
        <div class="dept-staff-name">${s.name}</div>
        <div class="dept-staff-role">${s.fullTitle}</div>
        <div class="dept-staff-qual">${s.qual}</div>
        <div class="dept-staff-exp">📅 ${s.exp} Experience</div>
      </div>
    </div>`).join('');

  document.getElementById('deptDetailContent').innerHTML = `
    <div class="dept-detail-hero" style="background:${d.gradient}">
      <div class="container">
        <div class="dept-detail-badge">${d.degree} · ${d.years} Years · ${d.semesters} Semesters</div>
        <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
          <div style="font-size:60px;">${d.icon}</div>
          <div>
            <div class="dept-detail-title">${d.name}</div>
            <p style="color:rgba(255,255,255,0.85);max-width:700px;font-size:14px;line-height:1.7;">${d.desc}</p>
          </div>
        </div>
        <div class="dept-info-grid">
          <div class="dept-info-item"><div class="dept-info-label">Degree</div><div class="dept-info-value">${d.degree}</div></div>
          <div class="dept-info-item"><div class="dept-info-label">Duration</div><div class="dept-info-value">${d.years} Years</div></div>
          <div class="dept-info-item"><div class="dept-info-label">Intake</div><div class="dept-info-value">${d.intake} Seats</div></div>
          <div class="dept-info-item"><div class="dept-info-label">Semester Fee</div><div class="dept-info-value">${d.fee}</div></div>
          <div class="dept-info-item"><div class="dept-info-label">Regulation</div><div class="dept-info-value">TVU ${d.regulation}</div></div>
          <div class="dept-info-item"><div class="dept-info-label">University</div><div class="dept-info-value">Thiruvalluvar University</div></div>
        </div>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="grid-2" style="gap:36px;align-items:start;">
          <div>
            <div class="sec-label">Syllabus</div>
            <h2 class="sec-title">Subjects <span>Covered</span></h2>
            <div class="subjects-list">
              ${d.subjects.map(s=>`<div class="subject-chip">${s}</div>`).join('')}
            </div>
          </div>
          <div>
            <div class="sec-label">Career Paths</div>
            <h2 class="sec-title">Career <span>Opportunities</span></h2>
            <div style="margin-top:16px;">
              ${d.careers.map(c=>`<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--mid-gray);"><span style="color:var(--red);font-size:16px;">→</span><span style="font-size:14px;font-weight:600;">${c}</span></div>`).join('')}
            </div>
            <div style="margin-top:24px;padding:16px;background:var(--off-white);border-radius:var(--radius);border:1px solid var(--border);">
              <div style="font-size:12.5px;font-weight:700;color:var(--navy);margin-bottom:6px;">🎯 Campus Placement Eligible</div>
              <p style="font-size:12px;color:var(--text-light);line-height:1.6;">Final-year ${d.short} students are eligible for campus placement drives with TCS, Cognizant, HCL and other partners.</p>
            </div>
            <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSd-B9wg745SHXN0oDn7D7p34WdOnvMQ5neuY9iQoqcWkoXRLQ/viewform" target="_blank" class="btn-primary">Apply for ${d.short} →</a>
              <button onclick="showPage('admissions')" style="padding:10px 18px;border:2px solid var(--red);color:var(--red);border-radius:6px;font-size:13px;font-weight:700;background:none;cursor:pointer;">Fee Details</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- STAFF SECTION -->
    <section class="dept-staff-section">
      <div class="container">
        <div class="text-center" style="margin-bottom:28px;">
          <div class="sec-label">Meet the Team</div>
          <h2 class="sec-title">Department <span>Faculty</span></h2>
          <p style="color:var(--text-light);font-size:13.5px;">Click on any faculty member to view their full profile.</p>
        </div>
        <div class="dept-staff-grid">${staffHTML || '<div style="padding:28px;text-align:center;color:var(--text-light);">Staff details will be updated soon.</div>'}</div>
      </div>
    </section>
    <section class="section alt">
      <div class="container text-center">
        <button onclick="showPage('courses')" style="display:inline-flex;align-items:center;gap:8px;background:var(--red);color:#fff;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;border:none;">← Back to All Departments</button>
        &nbsp;
        <button onclick="showPage('faculty')" style="display:inline-flex;align-items:center;gap:8px;background:var(--navy);color:#fff;padding:12px 24px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;border:none;">View All Faculty →</button>
      </div>
    </section>`;
  showPage('dept-detail');
}

/* ═════════════════════════════════════════════════════════
   FACULTY PAGE
═════════════════════════════════════════════════════════ */
let allFacultyVisible = [...STAFF_DATA];
function renderFacultyPage() {
  const container = document.getElementById('facultyGroupsContainer');
  if (!container) return;
  renderFacultyGroups(allFacultyVisible, container);
}
function renderFacultyGroups(staffList, container) {
  if (staffList.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--text-light);">No faculty found for the selected filters.</div>';
    const c = document.getElementById('facCount'); if(c) c.textContent='0';
    return;
  }
  // Group by dept
  const grouped = {};
  staffList.forEach(s => {
    if (!grouped[s.dept]) grouped[s.dept] = { name:s.deptName, staff:[] };
    grouped[s.dept].staff.push(s);
  });
  const deptOrder = DEPARTMENTS.map(d=>d.id);
  const sortedKeys = Object.keys(grouped).sort((a,b)=>deptOrder.indexOf(a)-deptOrder.indexOf(b));
  const deptMeta = {};
  DEPARTMENTS.forEach(d=>{ deptMeta[d.id]={ gradient:d.gradient, icon:d.icon }; });

  container.innerHTML = sortedKeys.map(deptId => {
    const g = grouped[deptId];
    const meta = deptMeta[deptId]||{ gradient:'linear-gradient(135deg,#1a3a7a,#0a1a5a)', icon:'🎓' };
    const cardsHTML = g.staff.map(s => `
      <div class="staff-card ${s.desig==='HOD'?'hod-card':''}" onclick="openStaffModal('${s.id}')">
        ${staffPhotoHTML(s, s.desig==='HOD'?110:100)}
        <span class="staff-designation-badge ${
          s.desig==='HOD'?'badge-hod':s.desig==='Professor'?'badge-prof':
          s.desig==='Guest Faculty'?'badge-guest':'badge-asst'
        }">${s.desig==='HOD'?'⭐✨ HOD':s.desig}</span>
        <div class="staff-name">${s.name}</div>
        <div class="staff-title">${s.fullTitle}</div>
        <div class="staff-qual">${s.qual}</div>
        <div class="staff-exp">📅 ${s.exp}</div>
        <div class="staff-spec">${s.spec.split(',')[0]}</div>
        <div class="staff-view-btn">View Profile →</div>
      </div>`).join('');
    return `<div class="faculty-dept-group">
      <div class="faculty-dept-group-header" style="background:${meta.gradient}">
        <span class="dept-group-icon">${meta.icon}</span>
        <h3>${g.name}</h3>
        <span class="dept-group-count">${g.staff.length} Faculty</span>
      </div>
      <div class="staff-grid">${cardsHTML}</div>
    </div>`;
  }).join('');

  const c = document.getElementById('facCount');
  if(c) c.textContent = staffList.length;
}
function filterFaculty() {
  const dept   = (document.getElementById('facDeptFilter')?.value  || '').trim();
  const desig  = (document.getElementById('facDesigFilter')?.value || '').trim();
  const search = (document.getElementById('facSearch')?.value      || '').toLowerCase().trim();
  allFacultyVisible = STAFF_DATA.filter(s =>
    (!dept   || s.dept === dept) &&
    (!desig  || s.desig === desig) &&
    (!search || s.name.toLowerCase().includes(search) || s.spec.toLowerCase().includes(search))
  );
  const container = document.getElementById('facultyGroupsContainer');
  if (container) renderFacultyGroups(allFacultyVisible, container);
}
function resetFacFilter() {
  ['facDeptFilter','facDesigFilter','facSearch'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value='';
  });
  allFacultyVisible = [...STAFF_DATA];
  const container = document.getElementById('facultyGroupsContainer');
  if (container) renderFacultyGroups(allFacultyVisible, container);
}

/* ═════════════════════════════════════════════════════════
   STAFF MODAL
═════════════════════════════════════════════════════════ */
function openStaffModal(staffId) {
  const s = STAFF_DATA.find(x => x.id === staffId);
  if (!s) return;
  const badge = s.desig==='HOD'?'badge-hod':s.desig==='Professor'?'badge-prof':
                s.desig==='Guest Faculty'?'badge-guest':'badge-asst';
  document.getElementById('staffModalHeader').innerHTML = `
    <div class="staff-modal-photo">
      <img src="${STAF}${s.photo}" alt="${s.name}"
        onerror="this.style.display='none';this.nextSibling.style.display='flex';">
      <div class="staff-avatar-fallback" style="display:none;background:${s.avatarColor};width:100%;height:100%;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:#fff;">
        ${s.name.split(' ').map(w=>w[0]).join('').substring(0,2)}
      </div>
    </div>
    <div class="staff-modal-info">
      <span class="staff-modal-badge ${badge}">${s.desig==='HOD'?'⭐ Head of Department':s.desig}</span>
      <div class="staff-modal-name">${s.name}</div>
      <div class="staff-modal-title">${s.fullTitle}</div>
      <div class="staff-modal-dept">🏛 ${s.deptName}</div>
    </div>
    <button class="staff-modal-close" onclick="closeStaffModal()">✕</button>`;

  document.getElementById('staffModalBody').innerHTML = `
    <div class="staff-modal-grid">
      <div class="staff-modal-item"><div class="staff-modal-item-label">Qualification</div><div class="staff-modal-item-value">${s.qual}</div></div>
      <div class="staff-modal-item"><div class="staff-modal-item-label">Experience</div><div class="staff-modal-item-value">${s.exp}</div></div>
      <div class="staff-modal-item"><div class="staff-modal-item-label">Joined</div><div class="staff-modal-item-value">${s.joined}</div></div>
      <div class="staff-modal-item"><div class="staff-modal-item-label">Email</div><div class="staff-modal-item-value" style="font-size:12px;">${s.email}</div></div>
    </div>
    <div class="staff-modal-item" style="margin-top:12px;"><div class="staff-modal-item-label">Specialization</div><div class="staff-modal-item-value">${s.spec}</div></div>
    <div class="staff-modal-publications">
      <h4>📚 Academic Profile</h4>
      <p>${s.publications}</p>
    </div>`;

  const overlay = document.getElementById('staffModalOverlay');
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow='hidden'; }
}
function closeStaffModal(event) {
  if (event && event.target !== document.getElementById('staffModalOverlay')) return;
  const overlay = document.getElementById('staffModalOverlay');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow=''; }
}

/* ═════════════════════════════════════════════════════════
   PLACEMENTS
═════════════════════════════════════════════════════════ */
function renderPlacements() {
  const cg = document.getElementById('companiesGrid');
  if (cg && !cg.dataset.rendered) {
    cg.innerHTML = COMPANIES.map(c=>`<div class="company-badge"><div class="icon">${c.icon}</div><div class="name">${c.name}</div><div class="sector">${c.sector}</div></div>`).join('');
    cg.dataset.rendered='1';
  }
  const tg = document.getElementById('testimonialsGrid');
  if (tg && !tg.dataset.rendered) {
    tg.innerHTML = TESTIMONIALS.map(t=>`<div class="testimonial-card"><div class="testimonial-quote">"</div><p class="testimonial-text">${t.text}</p><div class="testimonial-author"><div class="testimonial-avatar">${t.initials}</div><div><div class="testimonial-name">${t.name}</div><div class="testimonial-batch">${t.batch}</div><div class="testimonial-company">${t.company}</div></div></div></div>`).join('');
    tg.dataset.rendered='1';
  }
}
function renderCompanyLogos() {
  const row = document.getElementById('companyLogosRow');
  if (row && !row.dataset.rendered) {
    row.innerHTML = COMPANIES.map(c=>`<div class="company-logo-chip"><span>${c.icon}</span><span>${c.name}</span></div>`).join('');
    row.dataset.rendered='1';
  }
}

/* ═════════════════════════════════════════════════════════
   QUESTION PAPERS
═════════════════════════════════════════════════════════ */
let filteredQP = [...QUESTION_PAPERS];
function renderQPapers() {
  const tbody = document.getElementById('qpTableBody');
  const count = document.getElementById('qpCount');
  if (!tbody) return;
  if (!filteredQP.length) {
    tbody.innerHTML=`<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-light);">No papers found. <a href="${TVU_QP_URL}" target="_blank" style="color:var(--red);font-weight:700;">Visit TVU →</a></td></tr>`;
    if(count) count.textContent='0'; return;
  }
  tbody.innerHTML = filteredQP.map((p,i)=>`<tr>
    <td style="color:var(--text-light);font-size:12px;">${i+1}</td>
    <td style="font-weight:600;">${p.deptName}</td>
    <td>${p.subject}</td>
    <td style="font-family:monospace;font-size:12px;color:var(--navy);">${p.code}</td>
    <td>${p.year} (${p.month})</td>
    <td><span style="background:var(--off-white);border:1px solid var(--border);padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700;">Sem ${p.sem}</span></td>
    <td style="font-size:12px;color:var(--text-light);">TVU ${p.reg}</td>
    <td><a href="${TVU_QP_URL}" target="_blank" class="btn-download">📄 View</a></td>
  </tr>`).join('');
  if(count) count.textContent = filteredQP.length;
}
function filterQPapers() {
  const dept = document.getElementById('qpDeptFilter')?.value   || '';
  const year = document.getElementById('qpYearFilter')?.value   || '';
  const sem  = document.getElementById('qpSemFilter')?.value    || '';
  const deg  = document.getElementById('qpDegreeFilter')?.value || '';
  filteredQP = QUESTION_PAPERS.filter(p =>
    (!dept||p.dept===dept)&&(!year||p.year===year)&&(!sem||p.sem===sem)&&(!deg||p.degree===deg)
  );
  renderQPapers();
}
function resetQPFilters() {
  ['qpDeptFilter','qpYearFilter','qpSemFilter','qpDegreeFilter'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  filteredQP=[...QUESTION_PAPERS]; renderQPapers();
}

/* ═════════════════════════════════════════════════════════
   FEES TABLE
═════════════════════════════════════════════════════════ */
function renderFeesTable() {
  const tbody = document.getElementById('feesTableBody');
  if (!tbody||tbody.dataset.rendered) return;
  const cats = {science:'Science & IT',commerce:'Commerce & Mgmt',arts:'Arts',pg:'PG'};
  tbody.innerHTML = DEPARTMENTS.map(d=>`<tr>
    <td style="font-weight:600;">${d.name}</td>
    <td>${cats[d.type]||d.type}</td>
    <td>${d.years} Yrs (${d.semesters} Sem)</td>
    <td><strong style="color:var(--red);">${d.fee}</strong>/semester</td>
  </tr>`).join('');
  tbody.dataset.rendered='1';
}

/* ═════════════════════════════════════════════════════════
   GALLERY
═════════════════════════════════════════════════════════ */
function filterGallery(cat, btn) {
  btn.closest('.gallery-tabs').querySelectorAll('.gallery-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#galleryGrid .gallery-item').forEach(item=>{
    item.style.display=(cat==='all'||item.dataset.cat===cat)?'':'none';
  });
}
function openLightbox(img) {
  const lb  = document.getElementById('galleryLightbox');
  const lbi = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCap');
  if(!lb||!lbi) return;
  lbi.src = img.src; lbi.alt = img.alt;
  if(cap) cap.textContent = img.closest('.gallery-item')?.querySelector('.gallery-cap')?.textContent||'';
  lb.style.display='flex'; document.body.style.overflow='hidden';
}
function closeLightbox() {
  const lb = document.getElementById('galleryLightbox');
  if(lb) { lb.style.display='none'; document.body.style.overflow=''; }
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeLightbox(); closeStaffModal(); }});

/* ─────────────────────────────────────────────────────────
   GALLERY — 3D TILT / DEPTH EFFECT
   Mouse-reactive tilt + glare on every gallery card. Pure
   pointer tracking, no extra HTML needed.
───────────────────────────────────────────────────────── */
function initGallery3D() {
  const grid = document.getElementById('galleryGrid');
  if (!grid || grid.dataset.tiltInit) return;
  grid.dataset.tiltInit = '1';

  // Skip on touch-only devices — tilt needs a hovering pointer
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

  grid.addEventListener('mousemove', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const r  = item.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top)  / r.height;
    const rotY = (px - 0.5) * 20;   // left/right tilt
    const rotX = (0.5 - py) * 20;   // up/down tilt
    item.style.setProperty('--rx', rotX.toFixed(2) + 'deg');
    item.style.setProperty('--ry', rotY.toFixed(2) + 'deg');
    item.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    item.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    item.classList.add('tilting');
  });

  grid.addEventListener('mouseout', e => {
    const item = e.target.closest('.gallery-item');
    if (item && (!e.relatedTarget || !item.contains(e.relatedTarget))) {
      item.classList.remove('tilting');
      item.style.removeProperty('--rx');
      item.style.removeProperty('--ry');
    }
  });
}
document.addEventListener('DOMContentLoaded', initGallery3D);

/* ═════════════════════════════════════════════════════════
   VIDEO SECTION
═════════════════════════════════════════════════════════ */
function loadCampusVideo() {
  // Admin: Replace this URL with the actual YouTube embed or video link
  const youtubeId = ''; // e.g. 'dQw4w9WgXcQ'
  const placeholder = document.getElementById('videoPlaceholder');
  const container   = document.getElementById('actualVideoContainer');
  if (!placeholder||!container) return;
  if (youtubeId) {
    container.innerHTML = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&rel=0" frameborder="0" allow="autoplay;encrypted-media" allowfullscreen style="width:100%;height:100%;border-radius:12px;"></iframe>`;
    placeholder.style.display='none'; container.style.display='block';
  } else {
    alert('📌 Video not added yet.\n\nTo add your video:\n1. Open index.html\n2. Find the videoPlaceholder section\n3. Replace with your YouTube embed or <video> tag\n4. Save and refresh.');
  }
}


/* ═════════════════════════════════════════════════════════
   CONTACT FORM
═════════════════════════════════════════════════════════ */
function submitContactForm() {
  const name = document.getElementById('cName')?.value.trim()||'';
  const email= document.getElementById('cEmail')?.value.trim()||'';
  const phone= document.getElementById('cPhone')?.value.trim()||'';
  const course=document.getElementById('cCourse')?.value.trim()||'';
  const msg  = document.getElementById('cMessage')?.value.trim()||'';
  const ok   = document.getElementById('contactSuccess');
  if (!name||!email||!msg) { alert('Please fill in Name, Email and Message.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email.'); return; }
  alert('Thank you for your message! We will get back to you within 24 hours.');
  if(ok) { ok.style.display='block'; ok.textContent='✅ Thank you! Your message has been received — we\'ll get back to you soon.'; }
  ['cName','cEmail','cPhone','cMessage','cCourse'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  setTimeout(()=>{ if(ok) ok.style.display='none'; },7000);
}

/* ═════════════════════════════════════════════════════════
   MOBILE NAV
═════════════════════════════════════════════════════════ */
function toggleNav() {
  const navList = document.getElementById('navList');
  const ham     = document.getElementById('hamburger');
  if(!navList) return;
  navList.classList.toggle('open');
  const spans = ham?.querySelectorAll('span');
  if (navList.classList.contains('open')) {
    if(spans){ spans[0].style.transform='translateY(7px) rotate(45deg)'; spans[1].style.opacity='0'; spans[2].style.transform='translateY(-7px) rotate(-45deg)'; }
  } else {
    if(spans) spans.forEach(s=>{s.style.transform='';s.style.opacity='';});
  }
}

/* ═════════════════════════════════════════════════════════
   SCROLL / BACK-TO-TOP
═════════════════════════════════════════════════════════ */
window.addEventListener('scroll', ()=>{
  const btn = document.getElementById('backToTop');
  if(btn) btn.classList.toggle('visible', window.scrollY>400);
});

/* ═════════════════════════════════════════════════════════
   COUNTER ANIMATION
═════════════════════════════════════════════════════════ */
function animateCount(el, target, suffix='') {
  let v=0; const dur=1800; const step=target/(dur/16);
  const t=setInterval(()=>{ v+=step; if(v>=target){v=target;clearInterval(t);} el.textContent=Math.floor(v)+suffix; },16);
}

/* ═════════════════════════════════════════════════════════
   INIT
═════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', ()=>{
  // Counter animation
  const e1=document.getElementById('statStudents');
  const e2=document.getElementById('statCourses');
  const e3=document.getElementById('statFaculty');
  if(e1) animateCount(e1,1900,'+');
  if(e2) animateCount(e2,16,'');
  if(e3) animateCount(e3,52,'+');

  // Initial renders
  renderHomeDeptGrid();
  renderCompanyLogos();
  filteredQP=[...QUESTION_PAPERS];

  // Start hero slider
  startSlider();

  // Live preview for note form
  ['nTitle','nSubject','nContent','nTopics','nDept','nYear','nSem'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input', updateNotePreview);
    document.getElementById(id)?.addEventListener('change', updateNotePreview);
  });
  document.querySelectorAll('input[name="nType"]').forEach(r=>r.addEventListener('change', updateNotePreview));

  // Enter key on login
  document.getElementById('stPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')staffLogin();});

  // Nav active link
  document.querySelectorAll('.nav-list > li > a').forEach(link=>{
    link.addEventListener('click',function(){
      document.querySelectorAll('.nav-list > li > a').forEach(l=>l.classList.remove('active'));
      this.classList.add('active');
      const nl=document.getElementById('navList');
      if(nl?.classList.contains('open')) toggleNav();
    });
  });
});

/* ═════════════════════════════════════════════════════════
   CLASS NOTES SYSTEM
   Storage key: 'sss_class_notes'  (localStorage)
   Each note: { id, dept, deptName, year, sem, subject,
                title, topics, content, type, staffName,
                staffId, date, timestamp }
═════════════════════════════════════════════════════════ */

/* ── Department name lookup ─── */
const DEPT_NAMES = {};
DEPARTMENTS.forEach(d=>{ DEPT_NAMES[d.id]=d.name; });

/* ── Note type icons ─── */
const NOTE_TYPE_ICONS = {
  'Lecture Notes':'📝',
  'Assignment':'📋',
  'Important Q&A':'❓',
  'Formula Sheet':'🔢',
  'Reference':'📚'
};
const NOTE_TYPE_COLORS = {
  'Lecture Notes':'#1a5a9a',
  'Assignment':'#7a2a00',
  'Important Q&A':'#5a1a8a',
  'Formula Sheet':'#1a6a4a',
  'Reference':'#9b2335'
};

/* ─────────────────────────────────────────────────────────
   STAFF DASHBOARD — LOGIN + TABS
───────────────────────────────────────────────────────── */
let currentStaffUser = null;

function staffLogin() {
  const id   = (document.getElementById('stId')?.value||'').trim();
  const pass = (document.getElementById('stPassword')?.value||'').trim();
  const res  = document.getElementById('staffLoginResult');
  if (!res) return;
  if (!id || !pass) {
    res.style.display='block'; res.className='login-result error';
    res.textContent='❌ Please enter your Staff ID and Password.';
    return;
  }
  const user = STAFF_USERS.find(u => u.id === id);
  if (user && user.password === pass) {
    currentStaffUser = { id: user.id, name: user.name, role: user.role, dept: user.dept, photo: user.photo };
    res.className='login-result success';
    res.textContent=`✅ Welcome, ${user.name}! Redirecting to Staff Dashboard…`;
    setTimeout(()=>{ openStaffDashboard(currentStaffUser); }, 900);
  } else {
    res.className='login-result error';
    res.textContent='❌ Invalid credentials';
  }
}

function staffAuthToken() { return localStorage.getItem('sss_staff_token'); }

function openStaffDashboard(user) {
  sessionStorage.setItem('staff_user', JSON.stringify(user));
  const av = document.getElementById('sdAvatar');
  const nm = document.getElementById('sdName');
  const rl = document.getElementById('sdRole');
  if(av) av.textContent = user.name.split(' ').pop()[0];
  if(nm) nm.textContent = user.name;
  if(rl) rl.textContent = user.role;
  showPage('staff-dashboard');
  switchStaffTab('notes');
}

function staffLogout() {
  currentStaffUser = null;
  sessionStorage.removeItem('staff_user');
  showPage('staff');
  document.getElementById('stId').value='';
  document.getElementById('stPassword').value='';
  document.getElementById('staffLoginResult').style.display='none';
}

function switchStaffTab(tab) {
  document.getElementById('sdPanelNotes').classList.toggle('active', tab==='notes');
  document.getElementById('sdPanelHistory').classList.toggle('active', tab==='history');
  document.getElementById('sdTabNotes').classList.toggle('active', tab==='notes');
  document.getElementById('sdTabHistory').classList.toggle('active', tab==='history');
  if (tab==='history') renderStaffHistory();
}

/* ─────────────────────────────────────────────────────────
   LIVE NOTE PREVIEW
───────────────────────────────────────────────────────── */
function updateNotePreview() {
  const pb = document.getElementById('notePreviewBody');
  if (!pb) return;
  const dept    = document.getElementById('nDept')?.value||'';
  const year    = document.getElementById('nYear')?.value||'';
  const sem     = document.getElementById('nSem')?.value||'';
  const subject = (document.getElementById('nSubject')?.value||'').trim();
  const title   = (document.getElementById('nTitle')?.value||'').trim();
  const topics  = (document.getElementById('nTopics')?.value||'').trim();
  const content = (document.getElementById('nContent')?.value||'').trim();
  const type    = document.querySelector('input[name="nType"]:checked')?.value||'Lecture Notes';
  const icon    = NOTE_TYPE_ICONS[type]||'📝';
  const color   = NOTE_TYPE_COLORS[type]||'#1a3a7a';
  const deptName= DEPT_NAMES[dept]||'—';
  if (!title && !content) {
    pb.innerHTML='<div class="np-placeholder">📒 Your note preview will appear here as you type...</div>';
    return;
  }
  pb.innerHTML=`
    <div class="np-badge" style="background:${color};">${icon} ${type}</div>
    <div class="np-title">${title||'(No title)'}</div>
    <div class="np-meta">${deptName} &nbsp;·&nbsp; ${year?year+' Year':''} ${sem?'Sem '+sem:''}</div>
    <div class="np-subject">${subject||''}</div>
    ${topics?`<div class="np-topics"><strong>Topics:</strong> ${topics}</div>`:''}
    <pre class="np-content">${escHTML(content).substring(0,600)}${content.length>600?'\n\n… (more content)':''}</pre>`;
}

function escHTML(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ─────────────────────────────────────────────────────────
   SUBMIT NOTE
───────────────────────────────────────────────────────── */
function submitNote() {
  if (!currentStaffUser) { alert('Please log in to the Staff Portal first.'); return; }
  const dept    = document.getElementById('nDept')?.value||'';
  const year    = document.getElementById('nYear')?.value||'';
  const sem     = document.getElementById('nSem')?.value||'';
  const subject = (document.getElementById('nSubject')?.value||'').trim();
  const title   = (document.getElementById('nTitle')?.value||'').trim();
  const topics  = (document.getElementById('nTopics')?.value||'').trim();
  const content = (document.getElementById('nContent')?.value||'').trim();
  const type    = document.querySelector('input[name="nType"]:checked')?.value||'Lecture Notes';

  if (!dept)    { alert('Please select a Department.'); return; }
  if (!year)    { alert('Please select the Academic Year.'); return; }
  if (!sem)     { alert('Please select the Semester.'); return; }
  if (!subject) { alert('Please enter the Subject name.'); return; }
  if (!title)   { alert('Please enter a Note Title.'); return; }
  if (!content || content.length < 20) { alert('Please enter note content (at least 20 characters).'); return; }

  const btn = document.getElementById('submitNoteBtn');
  if (btn) { btn.disabled=true; btn.textContent='Publishing…'; }

  const existing = JSON.parse(localStorage.getItem('staff_notes') || '[]');
  const note = {
    id: Date.now().toString(),
    dept, deptName: DEPT_NAMES[dept]||dept, year, sem, subject, title, topics, content, type,
    staffName: currentStaffUser.name,
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now()
  };
  existing.push(note);
  localStorage.setItem('staff_notes', JSON.stringify(existing));

  const ok = document.getElementById('noteUploadSuccess');
  if (ok) {
    ok.style.display='flex';
    ok.innerHTML=`<span style="font-size:22px;">✅</span>
      <div><strong>Note Published Successfully!</strong><br>
      <span style="font-size:12.5px;opacity:0.85;">"${title}" is now visible to students in the Class Notes section.</span></div>`;
    setTimeout(()=>{ ok.style.display='none'; },6000);
  }
  clearNoteForm();
  renderStaffHistory();
  if (btn) { btn.disabled=false; btn.textContent='📤 Publish Note for Students'; }
}

function clearNoteForm() {
  ['nDept','nYear','nSem','nSubject','nTitle','nTopics','nContent'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const def = document.querySelector('input[name="nType"][value="Lecture Notes"]');
  if(def) def.checked=true;
  updateNotePreview();
}

/* ─────────────────────────────────────────────────────────
   STAFF HISTORY (My Uploads Tab)
───────────────────────────────────────────────────────── */
function renderStaffHistory() {
  const container = document.getElementById('staffNoteHistory');
  if (!container||!currentStaffUser) return;
  const all = JSON.parse(localStorage.getItem('staff_notes') || '[]');
  const notes = all.filter(n => n.staffName === currentStaffUser.name);
  notesById = {}; notes.forEach(n => { notesById[n.id] = n; });
  if (!notes.length) {
    container.innerHTML=`<div class="cn-empty" style="display:flex;">
      <div class="cn-empty-icon">📭</div>
      <h3>No Notes Yet</h3>
      <p>You haven't uploaded any class notes. Go to the "Add Notes" tab to get started.</p></div>`;
    return;
  }
  container.innerHTML=`
    <div style="font-size:13px;color:var(--text-light);margin-bottom:16px;">
      <strong style="color:var(--navy);">${notes.length}</strong> note(s) published by you.
    </div>
    <div class="cn-grid">${notes.map(n=>noteCardHTML(n, true)).join('')}</div>`;
}

/* ═════════════════════════════════════════════════════════
   PDF CLASS NOTES — STATIC, NO BACKEND REQUIRED
   Students browse/view/download real PDF files, filtered by
   Department, Year and Semester.

   TO ADD A NEW NOTE:
   1. Drop the PDF inside  notes/<dept-id>/yourfile.pdf
   2. Add one entry below with matching dept/year/sem/fileUrl.
   That's it — no server, database or login needed.
═════════════════════════════════════════════════════════ */
const PDF_NOTES = [
  { id:'pn01', dept:'bsc-cs', year:'I',  sem:'I',   subject:'Programming in C',            title:'Unit 1 – Introduction to C & Data Types',        type:'Lecture Notes',  staffName:'Sathya A',        date:'2026-06-18', fileUrl:'notes/bsc-cs/c-programming-unit1.pdf',size:'1.2 MB' },
  { id:'pn02', dept:'bsc-cs', year:'II', sem:'III', subject:'Data Structures',              title:'Unit 3 – Stacks, Queues & Linked Lists',         type:'Lecture Notes',  staffName:'P.Monisha',       date:'2026-06-20', fileUrl:'notes/bsc-cs/data-structures-unit3.pdf',      size:'2.1 MB' },
  { id:'pn03', dept:'bsc-cs', year:'III',sem:'V',   subject:'Computer Networks',            title:'Important Questions – Unit 1 to 5',              type:'Important Q&A',  staffName:'Prof.N.Venugopal',date:'2026-06-15', fileUrl:'notes/bsc-cs/networks-important-qa.pdf',      size:'860 KB' },
  { id:'pn04', dept:'bca',    year:'I',  sem:'II',  subject:'C++ Programming',              title:'OOP Concepts – Complete Notes',                  type:'Lecture Notes',  staffName:'Sangeetha D',     date:'2026-06-22', fileUrl:'notes/bca/oop-cpp-notes.pdf',                 size:'1.8 MB' },
  { id:'pn05', dept:'bca',    year:'II', sem:'IV',  subject:'DBMS',                         title:'Assignment – Normalization & ER Diagrams',       type:'Assignment',     staffName:'ILAVARASI T R',   date:'2026-06-25', fileUrl:'notes/bca/dbms-assignment.pdf',               size:'640 KB' },
  { id:'pn06', dept:'bsc-data-science', year:'I', sem:'I', subject:'Python Programming',    title:'Unit 1 – Python Basics & Data Types',            type:'Lecture Notes',  staffName:'Dr. A. Priya Dharshini', date:'2026-06-19', fileUrl:'notes/bsc-data-science/python-unit1.pdf', size:'1.5 MB' },
  { id:'pn07', dept:'bsc-data-science', year:'II',sem:'III',subject:'Machine Learning',     title:'Formula Sheet – Regression & Classification',    type:'Formula Sheet',  staffName:'Mr. S. Vishnu Vardhan', date:'2026-06-27', fileUrl:'notes/bsc-data-science/ml-formula-sheet.pdf', size:'420 KB' },
  { id:'pn08', dept:'bsc-ai', year:'I',  sem:'II',  subject:'Introduction to AI',            title:'Unit 2 – Search Algorithms',                     type:'Lecture Notes',  staffName:'HOD',             date:'2026-06-21', fileUrl:'notes/bsc-ai/ai-unit2-search.pdf',            size:'1.4 MB' },
  { id:'pn09', dept:'bsc-chemistry', year:'I', sem:'I', subject:'Inorganic Chemistry',       title:'Unit 1 – Periodic Table & Bonding',              type:'Lecture Notes',  staffName:'HOD',             date:'2026-06-16', fileUrl:'notes/bsc-chemistry/inorganic-unit1.pdf',     size:'2.4 MB' },
  { id:'pn10', dept:'bcom',   year:'I',  sem:'I',   subject:'Financial Accounting',          title:'Unit 1 – Basics of Accounting',                  type:'Lecture Notes',  staffName:'HOD',             date:'2026-06-17', fileUrl:'notes/bcom/financial-accounting-unit1.pdf',   size:'1.1 MB' },
  { id:'pn11', dept:'bcom-ca',year:'II', sem:'III', subject:'Tally ERP 9',                   title:'Reference – Voucher Entry & GST',                type:'Reference',      staffName:'HOD',             date:'2026-06-24', fileUrl:'notes/bcom-ca/tally-erp9-reference.pdf',      size:'980 KB' },
  { id:'pn12', dept:'bba',    year:'I',  sem:'I',   subject:'Principles of Management',      title:'Unit 1 – Management Functions',                  type:'Lecture Notes',  staffName:'HOD',             date:'2026-06-14', fileUrl:'notes/bba/management-unit1.pdf',              size:'1.3 MB' },
  { id:'pn13', dept:'ba-tamil',year:'I', sem:'I',   subject:'இக்கால இலக்கியம்',              title:'பாட வைப்பு 1 – அறிமுகம்',                          type:'Lecture Notes',  staffName:'HOD',             date:'2026-06-13', fileUrl:'notes/ba-tamil/unit1-notes.pdf',              size:'900 KB' },
  { id:'pn14', dept:'msc-cs', year:'I',  sem:'I',   subject:'Advanced Algorithms',           title:'Important Q&A – Sorting & Graph Algorithms',     type:'Important Q&A',  staffName:'HOD',             date:'2026-06-23', fileUrl:'notes/msc-cs/advanced-algorithms-qa.pdf',     size:'1.0 MB' },
  { id:'pn15', dept:'mcom',   year:'I',  sem:'I',   subject:'Corporate Finance',             title:'Unit 1 – Time Value of Money',                   type:'Lecture Notes',  staffName:'HOD',             date:'2026-06-26', fileUrl:'notes/mcom/corporate-finance-unit1.pdf',      size:'1.6 MB' },
  { id:'pn16', dept:'bsc-cs', year:'II', sem:'III', subject:'Environmental Studies',         title:'Renewable and Non-Renewable Resources',          type:'Lecture Notes',  staffName:'Sathya A',        date:'2026-07-14', fileUrl:'notes/bsc-cs/renewable-and-non-renewable-resources.pdf', size:'2.7 MB' },
  { id:'pn17', dept:'bsc-cs', year:'II', sem:'III', subject:'Environmental Studies',         title:'Chapter 3 – Forest Resources',                   type:'Lecture Notes',  staffName:'Sathya A',        date:'2026-07-14', fileUrl:'notes/bsc-cs/forest-resources.pdf',            size:'4.5 MB' }
];

let pdfNotesById = {};

/* ─────────────────────────────────────────────────────────
   CLASS NOTES PAGE — STUDENT VIEW (PDF)
───────────────────────────────────────────────────────── */
function filterPdfNotes() {
  const dept   = document.getElementById('cnDeptFilter')?.value||'';
  const year   = document.getElementById('cnYearFilter')?.value||'';
  const sem    = document.getElementById('cnSemFilter')?.value||'';
  const type   = document.getElementById('cnTypeFilter')?.value||'';
  const search = (document.getElementById('cnSearch')?.value||'').trim().toLowerCase();
  const sort   = document.getElementById('cnSortFilter')?.value||'newest';
  const dateR  = document.getElementById('cnDateFilter')?.value||'';

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7*24*60*60*1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getFullYear(), now.getMonth()-1, now.getDate()).toISOString().split('T')[0];

  let notes = PDF_NOTES.filter(n =>
    (!dept || n.dept===dept) &&
    (!year || n.year===year) &&
    (!sem  || n.sem===sem)   &&
    (!type || n.type===type) &&
    (!search || (n.title+' '+n.subject).toLowerCase().includes(search)) &&
    (!dateR || (dateR==='today' && n.date===today) ||
               (dateR==='week' && n.date>=weekAgo) ||
               (dateR==='month' && n.date>=monthAgo))
  );

  if (sort==='newest')       notes = notes.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
  else if (sort==='oldest')  notes = notes.slice().sort((a,b)=> new Date(a.date)-new Date(b.date));
  else if (sort==='subject') notes = notes.slice().sort((a,b)=> a.subject.localeCompare(b.subject));

  pdfNotesById = {};
  notes.forEach(n=>{ pdfNotesById[n.id]=n; });
  renderPdfNotesGrid(notes);
  updatePdfNoteStats();
}

function resetPdfNotesFilter() {
  ['cnDeptFilter','cnYearFilter','cnSemFilter','cnTypeFilter','cnSearch','cnDateFilter'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const sf=document.getElementById('cnSortFilter'); if(sf) sf.value='newest';
  filterPdfNotes();
}

function renderPdfNotesGrid(notes) {
  const grid  = document.getElementById('cnGrid');
  const empty = document.getElementById('cnEmpty');
  const rc    = document.getElementById('cnResultCount');
  if (!grid) return;
  if (!notes.length) {
    grid.innerHTML='';
    if(empty) empty.style.display='flex';
    if(rc) rc.textContent='No notes found';
    return;
  }
  if(empty) empty.style.display='none';
  if(rc) rc.textContent=`Showing ${notes.length} note${notes.length===1?'':'s'}`;
  grid.innerHTML = notes.map(n=>pdfNoteCardHTML(n)).join('');
}

function pdfNoteCardHTML(n) {
  const icon     = NOTE_TYPE_ICONS[n.type]||'📄';
  const color    = NOTE_TYPE_COLORS[n.type]||'#1a3a7a';
  const deptName = DEPT_NAMES[n.dept]||n.dept;
  const dateStr  = new Date(n.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  return `<div class="cn-card cn-card-pdf">
    <div class="cn-card-top" style="background:${color};" onclick="openPdfNoteModal('${n.id}')">
      <span class="cn-card-type-icon">${icon}</span>
      <span class="cn-card-type">${n.type}</span>
      <span class="cn-pdf-tag">PDF</span>
    </div>
    <div class="cn-card-body" onclick="openPdfNoteModal('${n.id}')">
      <div class="cn-card-dept">${deptName}</div>
      <div class="cn-card-meta">
        <span class="cn-badge year">Year ${n.year}</span>
        <span class="cn-badge sem">Sem ${n.sem}</span>
      </div>
      <div class="cn-card-subject">${n.subject}</div>
      <div class="cn-card-title">${n.title}</div>
    </div>
    <div class="cn-card-footer">
      <span class="cn-card-staff">👨‍🏫 ${n.staffName}</span>
      <span class="cn-card-date">📅 ${dateStr}</span>
    </div>
    <div class="cn-card-actions">
      <a href="${n.fileUrl}" target="_blank" class="cn-btn cn-btn-view" onclick="event.stopPropagation()">👁 View</a>
      <a href="${n.fileUrl}" download class="cn-btn cn-btn-download" onclick="event.stopPropagation()">⬇ Download</a>
    </div>
  </div>`;
}

function updatePdfNoteStats() {
  const all = PDF_NOTES;
  const today = new Date().toISOString().split('T')[0];
  const depts = new Set(all.map(n=>n.dept)).size;
  const todayCount = all.filter(n=>n.date===today).length;
  const t=document.getElementById('cnStatTotal'); if(t) t.textContent=all.length;
  const d=document.getElementById('cnStatDepts'); if(d) d.textContent=depts;
  const td=document.getElementById('cnStatToday'); if(td) td.textContent=todayCount;
}

function openPdfNoteModal(noteId) {
  const note = pdfNotesById[noteId] || PDF_NOTES.find(n=>n.id===noteId);
  if (!note) return;
  const icon     = NOTE_TYPE_ICONS[note.type]||'📄';
  const color    = NOTE_TYPE_COLORS[note.type]||'#1a3a7a';
  const deptName = DEPT_NAMES[note.dept]||note.dept;
  const dateStr  = new Date(note.date).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});

  document.getElementById('noteModalHeader').innerHTML=`
    <div class="nm-header" style="background:${color};">
      <div class="nm-header-icon">${icon}</div>
      <div class="nm-header-info">
        <div class="nm-type">${note.type} · PDF</div>
        <div class="nm-title">${note.title}</div>
        <div class="nm-subject">${note.subject} &nbsp;·&nbsp; ${deptName}</div>
      </div>
      <button class="nm-close" onclick="closePdfNoteModal()">✕</button>
    </div>
    <div class="nm-meta-bar">
      <span class="cn-badge year" style="font-size:12px;">📅 Year ${note.year}</span>
      <span class="cn-badge sem" style="font-size:12px;">📖 Semester ${note.sem}</span>
      <span style="font-size:12px;color:var(--text-light);">👨‍🏫 ${note.staffName}</span>
      <span style="font-size:12px;color:var(--text-light);">🗓 ${dateStr}</span>
      ${note.size?`<span style="font-size:12px;color:var(--text-light);">📦 ${note.size}</span>`:''}
    </div>`;

  document.getElementById('noteModalBody').innerHTML=`
    <div class="nm-pdf-preview">
      <iframe src="${note.fileUrl}" title="${note.title}" loading="lazy"></iframe>
      <div class="nm-pdf-fallback">📄 Preview not available? <a href="${note.fileUrl}" target="_blank">Open the PDF directly →</a></div>
    </div>`;

  document.getElementById('noteModalFooter').innerHTML=`
    <a href="${note.fileUrl}" target="_blank" class="btn-primary">👁 Open Full PDF →</a>
    <a href="${note.fileUrl}" download class="btn-outline" style="border-color:var(--navy);color:var(--navy);">⬇ Download PDF</a>
    <button class="btn-outline" onclick="closePdfNoteModal()" style="border-color:var(--navy);color:var(--navy);">Close</button>`;

  const ov = document.getElementById('noteModalOverlay');
  if(ov) { ov.classList.add('open'); document.body.style.overflow='hidden'; }
}

function closePdfNoteModal(event) {
  if (event && event.target!==document.getElementById('noteModalOverlay')) return;
  const ov=document.getElementById('noteModalOverlay');
  if(ov) { ov.classList.remove('open'); document.body.style.overflow=''; }
}

/* ─────────────────────────────────────────────────────────
   CLASS NOTES PAGE — STUDENT VIEW (LEGACY TEXT/BACKEND)
   Kept only for the Staff Dashboard's "My Notes" tab, which
   still talks to the optional backend. Not used by students.
───────────────────────────────────────────────────────── */
function filterNotes() {
  const grid = document.getElementById('cnGrid');
  if (grid) grid.innerHTML = `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-light);">No notes available</div>`;
}

function resetNotesFilter() {
  ['cnDeptFilter','cnYearFilter','cnSemFilter','cnTypeFilter','cnSearch'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const sf=document.getElementById('cnSortFilter'); if(sf) sf.value='newest';
  filterNotes();
}

function renderNotesGrid(notes) {
  const grid  = document.getElementById('cnGrid');
  const empty = document.getElementById('cnEmpty');
  const rc    = document.getElementById('cnResultCount');
  if (!grid) return;
  if (!notes.length) {
    grid.innerHTML='';
    if(empty) empty.style.display='flex';
    if(rc) rc.textContent='No notes found';
    return;
  }
  if(empty) empty.style.display='none';
  if(rc) rc.textContent=`Showing ${notes.length} note${notes.length===1?'':'s'}`;
  grid.innerHTML = notes.map(n=>noteCardHTML(n, false)).join('');
}

function noteCardHTML(n, isStaffView) {
  const icon  = NOTE_TYPE_ICONS[n.type]||'📝';
  const color = NOTE_TYPE_COLORS[n.type]||'#1a3a7a';
  const preview = n.content.substring(0,120).replace(/\n/g,' ')+'…';
  const dateStr = new Date(n.timestamp).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  return `<div class="cn-card" onclick="openNoteModal('${n.id}')">
    <div class="cn-card-top" style="background:${color};">
      <span class="cn-card-type-icon">${icon}</span>
      <span class="cn-card-type">${n.type}</span>
      ${isStaffView?`<button class="cn-delete-btn" onclick="deleteNote(event,'${n.id}')" title="Delete">🗑</button>`:''}
    </div>
    <div class="cn-card-body">
      <div class="cn-card-dept">${n.deptName}</div>
      <div class="cn-card-meta">
        <span class="cn-badge year">Year ${n.year}</span>
        <span class="cn-badge sem">Sem ${n.sem}</span>
      </div>
      <div class="cn-card-subject">${n.subject}</div>
      <div class="cn-card-title">${n.title}</div>
      <div class="cn-card-preview">${preview}</div>
      ${n.topics?`<div class="cn-card-topics"><strong>Topics:</strong> ${n.topics}</div>`:''}
    </div>
    <div class="cn-card-footer">
      <span class="cn-card-staff">👨‍🏫 ${n.staffName}</span>
      <span class="cn-card-date">📅 ${dateStr}</span>
    </div>
  </div>`;
}

function updateCnStats() {}

/* ─────────────────────────────────────────────────────────
   NOTE DETAIL MODAL
───────────────────────────────────────────────────────── */
function openNoteModal(noteId) {
  const note = notesById[String(noteId)];
  if (!note) return;
  const icon  = NOTE_TYPE_ICONS[note.type]||'📝';
  const color = NOTE_TYPE_COLORS[note.type]||'#1a3a7a';
  const dateStr = new Date(note.timestamp).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});

  document.getElementById('noteModalHeader').innerHTML=`
    <div class="nm-header" style="background:${color};">
      <div class="nm-header-icon">${icon}</div>
      <div class="nm-header-info">
        <div class="nm-type">${note.type}</div>
        <div class="nm-title">${note.title}</div>
        <div class="nm-subject">${note.subject} &nbsp;·&nbsp; ${note.deptName}</div>
      </div>
      <button class="nm-close" onclick="closeNoteModal()">✕</button>
    </div>
    <div class="nm-meta-bar">
      <span class="cn-badge year" style="font-size:12px;">📅 Year ${note.year}</span>
      <span class="cn-badge sem" style="font-size:12px;">📖 Semester ${note.sem}</span>
      <span style="font-size:12px;color:var(--text-light);">👨‍🏫 ${note.staffName}</span>
      <span style="font-size:12px;color:var(--text-light);">🗓 ${dateStr}</span>
    </div>`;

  document.getElementById('noteModalBody').innerHTML=`
    ${note.topics?`<div class="nm-topics-bar"><strong>📌 Topics Covered:</strong> ${note.topics}</div>`:''}
    <pre class="nm-content">${escHTML(note.content)}</pre>`;

  document.getElementById('noteModalFooter').innerHTML=`
    <button class="btn-primary" onclick="printNote('${note.id}')">🖨️ Print / Save PDF</button>
    <button class="btn-outline" onclick="closeNoteModal()" style="border-color:var(--navy);color:var(--navy);">Close</button>`;

  const ov = document.getElementById('noteModalOverlay');
  if(ov) { ov.classList.add('open'); document.body.style.overflow='hidden'; }
}

function closeNoteModal(event) {
  if (event && event.target!==document.getElementById('noteModalOverlay')) return;
  const ov=document.getElementById('noteModalOverlay');
  if(ov) { ov.classList.remove('open'); document.body.style.overflow=''; }
}

function printNote(noteId) {
  const note = notesById[String(noteId)];
  if(!note) return;
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${note.title}</title>
    <style>body{font-family:Arial,sans-serif;max-width:720px;margin:40px auto;line-height:1.8;color:#222;}
    h1{color:#9b2335;border-bottom:2px solid #9b2335;padding-bottom:8px;}
    .meta{background:#f5f5f5;padding:12px 16px;border-radius:6px;font-size:13px;margin:16px 0;}
    pre{white-space:pre-wrap;font-family:inherit;font-size:14px;}</style></head>
    <body><h1>${note.title}</h1>
    <div class="meta">
      <strong>Department:</strong> ${note.deptName} &nbsp;|&nbsp;
      <strong>Year:</strong> ${note.year} &nbsp;|&nbsp;
      <strong>Semester:</strong> ${note.sem}<br>
      <strong>Subject:</strong> ${note.subject} &nbsp;|&nbsp;
      <strong>Type:</strong> ${note.type}<br>
      <strong>Faculty:</strong> ${note.staffName} &nbsp;|&nbsp;
      <strong>Date:</strong> ${note.date}
    </div>
    ${note.topics?`<p><strong>Topics Covered:</strong> ${note.topics}</p>`:''}
    <pre>${note.content}</pre>
    <hr style="margin-top:32px;"><p style="font-size:12px;color:#888;">SSS College of Arts, Science &amp; Management — Arcot</p>
    </body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

/* ─────────────────────────────────────────────────────────
   DELETE NOTE (Staff Only)
───────────────────────────────────────────────────────── */
function deleteNote(event, noteId) {
  event.stopPropagation();
  if (!confirm('Delete this note? Students will no longer see it.')) return;
  let all = JSON.parse(localStorage.getItem('staff_notes') || '[]');
  all = all.filter(n => n.id !== String(noteId));
  localStorage.setItem('staff_notes', JSON.stringify(all));
  delete notesById[String(noteId)];
  renderStaffHistory();
}


/* showPage patch removed — class-notes handled in onPageShown */

/* ---------------------------------------------------------
   CAMPUS VIDEO PLAYER � autoplay � muted � loop
   Video file: videos/campus-tour.mp4
--------------------------------------------------------- */

/* Called on <video> error � shows fallback card */
function handleVideoError() {
  const vid = document.getElementById('campusVideoEl');
  const fb  = document.getElementById('cvwFallback');
  if (vid) vid.style.display = 'none';
  if (fb)  fb.style.display  = 'flex';
  const ctrl = document.getElementById('cvwControls');
  if (ctrl) ctrl.style.display = 'none';
  const badge = document.querySelector('.cvw-badge');
  if (badge) badge.style.display = 'none';
}

/* Also handle network-level 404 via fetch check */
function checkVideoExists() {
  fetch('videos/campus-tour.mp4', { method: 'HEAD' })
    .then(res => {
      if (!res.ok) handleVideoError();
    })
    .catch(() => handleVideoError());
}

/* Play / Pause toggle */
function toggleVideoPlay() {
  const vid  = document.getElementById('campusVideoEl');
  const icon = document.getElementById('cvwPlayIcon');
  if (!vid) return;
  if (vid.paused) {
    vid.play();
    if (icon) icon.textContent = '?';
  } else {
    vid.pause();
    if (icon) icon.textContent = '?';
  }
}

/* Mute / Unmute toggle */
function toggleVideoMute() {
  const vid = document.getElementById('campusVideoEl');
  const btn = document.getElementById('cvwMuteBtn');
  const lbl = document.querySelector('.cvw-label');
  if (!vid) return;
  vid.muted = !vid.muted;
  if (btn) btn.textContent = vid.muted ? '??' : '??';
  if (lbl) lbl.textContent = vid.muted ? 'Auto-playing � Muted' : 'Auto-playing � Audio On';
}

/* Init video on page load */
document.addEventListener('DOMContentLoaded', () => {
  const vid = document.getElementById('campusVideoEl');
  if (!vid) return;

  /* Check if file actually exists */
  checkVideoExists();

  /* Force autoplay with fallback */
  const playPromise = vid.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      /* Autoplay blocked � show paused state */
      const icon = document.getElementById('cvwPlayIcon');
      if (icon) icon.textContent = '?';
    });
  }

  /* Keep looping just in case loop attr fails */
  vid.addEventListener('ended', () => { vid.currentTime = 0; vid.play(); });
});

/* ═════════════════════════════════════════════════════════
   MULTI-LANGUAGE SUPPORT — English / Tamil / Hindi
═════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  en: {
    nav_home: "Home", nav_about: "About SSS", nav_admissions: "Admissions", nav_academics: "Academics",
    nav_faculty: "Faculty", nav_exams: "Examinations", nav_placements: "Placements", nav_gallery: "Gallery",
    nav_contact: "Contact", nav_login: "Staff Portal", nav_apply: "Apply Now",
    hero_badge: "Established 2005 · Affiliated to Thiruvalluvar University",
    hero_desc: "Established in 2005 and affiliated to Thiruvalluvar University, Vellore — SSS College offers undergraduate and postgraduate degrees in Arts, Science, Commerce & Management with experienced faculty and strong placement support.",
    stat_students: "Students", stat_programmes: "Programmes", stat_faculty: "Faculty", stat_years: "Years",
    hero_apply: "Apply Now 2026–27", hero_explore: "Explore Programmes", scroll_down: "Scroll Down",
    announcements: "Announcements", governance: "Governance", board_of: "Board of", trustees: "Trustees",
    footer_quicklinks: "Quick Links", footer_examres: "Exam Resources", footer_contactus: "Contact Us",
    desktop_view_on: "View Full Desktop Site", desktop_view_off: "Switch to Mobile View",
    popup_title: "Upcoming Events & Notifications", popup_sub: "Stay updated with what's happening at SSS College",
    ev1_title: "Admissions Open 2026–27", ev1_desc: "UG & PG applications now open. Apply online before seats close.",
    ev2_title: "Campus Placement Drive", ev2_desc: "TVS recruitment drive on campus — final-year students register now.",
    ev3_title: "Semester Exam Results", ev3_desc: "TVU semester results released — check your COE portal.",
    popup_dontshow: "Don't show again today", popup_close: "Got it"
  },
  ta: {
    nav_home: "முகப்பு", nav_about: "எஸ்.எஸ்.எஸ் பற்றி", nav_admissions: "சேர்க்கை", nav_academics: "படிப்புகள்",
    nav_faculty: "ஆசிரியர்கள்", nav_exams: "தேர்வுகள்", nav_placements: "வேலைவாய்ப்பு", nav_gallery: "படத்தொகுப்பு",
    nav_contact: "தொடர்பு", nav_login: "மாணவர் உள்நுழைவு", nav_apply: "இப்போது விண்ணப்பிக்க",
    hero_badge: "2005ல் நிறுவப்பட்டது · திருவள்ளுவர் பல்கலைக்கழகத்துடன் இணைக்கப்பட்டுள்ளது",
    hero_desc: "2005ல் நிறுவப்பட்டு, வேலூர் திருவள்ளுவர் பல்கலைக்கழகத்துடன் இணைக்கப்பட்ட எஸ்.எஸ்.எஸ் கல்லூரி, கலை, அறிவியல், வணிகவியல் மற்றும் மேலாண்மைத் துறைகளில் இளங்கலை மற்றும் முதுகலைப் படிப்புகளை அனுபவம் வாய்ந்த ஆசிரியர்களுடனும் சிறந்த வேலைவாய்ப்பு ஆதரவுடனும் வழங்குகிறது.",
    stat_students: "மாணவர்கள்", stat_programmes: "படிப்புகள்", stat_faculty: "ஆசிரியர்கள்", stat_years: "ஆண்டுகள்",
    hero_apply: "2026–27க்கு விண்ணப்பிக்க", hero_explore: "படிப்புகளை காண", scroll_down: "கீழே செல்ல",
    announcements: "அறிவிப்புகள்", governance: "நிர்வாகம்", board_of: "நிர்வாகக் குழு", trustees: "அறங்காவலர்கள்",
    footer_quicklinks: "விரைவு இணைப்புகள்", footer_examres: "தேர்வு தகவல்கள்", footer_contactus: "எங்களை தொடர்பு கொள்ள",
    desktop_view_on: "முழு டெஸ்க்டாப் தளத்தை காண", desktop_view_off: "மொபைல் தளத்திற்கு மாற",
    popup_title: "நிகழ்வுகள் & அறிவிப்புகள்", popup_sub: "எஸ்.எஸ்.எஸ் கல்லூரியில் நடப்பதை அறிந்து கொள்ளுங்கள்",
    ev1_title: "சேர்க்கை 2026–27 தொடங்கியது", ev1_desc: "இளங்கலை & முதுகலை விண்ணப்பங்கள் திறக்கப்பட்டுள்ளன. இடங்கள் நிறைவதற்குள் விண்ணப்பிக்கவும்.",
    ev2_title: "வேலைவாய்ப்பு முகாம்", ev2_desc: "TVS நிறுவன ஆட்சேர்ப்பு முகாம் — இறுதியாண்டு மாணவர்கள் இப்போதே பதிவு செய்யவும்.",
    ev3_title: "பருவத் தேர்வு முடிவுகள்", ev3_desc: "TVU பருவத் தேர்வு முடிவுகள் வெளியிடப்பட்டுள்ளன — உங்கள் COE போர்ட்டலில் பார்க்கவும்.",
    popup_dontshow: "இன்று மீண்டும் காட்ட வேண்டாம்", popup_close: "சரி"
  },
  hi: {
    nav_home: "होम", nav_about: "एसएसएस के बारे में", nav_admissions: "प्रवेश", nav_academics: "पाठ्यक्रम",
    nav_faculty: "संकाय", nav_exams: "परीक्षाएँ", nav_placements: "प्लेसमेंट", nav_gallery: "गैलरी",
    nav_contact: "संपर्क करें", nav_login: "छात्र लॉगिन", nav_apply: "अभी आवेदन करें",
    hero_badge: "स्थापित 2005 · तिरुवल्लुवर विश्वविद्यालय से संबद्ध",
    hero_desc: "2005 में स्थापित और वेल्लोर के तिरुवल्लुवर विश्वविद्यालय से संबद्ध — एसएसएस कॉलेज कला, विज्ञान, वाणिज्य और प्रबंधन में स्नातक और स्नातकोत्तर डिग्री, अनुभवी संकाय और मजबूत प्लेसमेंट सहायता के साथ प्रदान करता है।",
    stat_students: "छात्र", stat_programmes: "पाठ्यक्रम", stat_faculty: "संकाय सदस्य", stat_years: "वर्ष",
    hero_apply: "2026–27 के लिए आवेदन करें", hero_explore: "पाठ्यक्रम देखें", scroll_down: "नीचे स्क्रॉल करें",
    announcements: "घोषणाएँ", governance: "प्रशासन", board_of: "न्यासी", trustees: "मंडल",
    footer_quicklinks: "त्वरित लिंक", footer_examres: "परीक्षा संसाधन", footer_contactus: "संपर्क करें",
    desktop_view_on: "पूर्ण डेस्कटॉप साइट देखें", desktop_view_off: "मोबाइल व्यू पर स्विच करें",
    popup_title: "आगामी कार्यक्रम और सूचनाएँ", popup_sub: "एसएसएस कॉलेज में हो रही गतिविधियों से अपडेट रहें",
    ev1_title: "प्रवेश 2026–27 शुरू", ev1_desc: "यूजी और पीजी आवेदन अब खुले हैं। सीटें भरने से पहले ऑनलाइन आवेदन करें।",
    ev2_title: "कैंपस प्लेसमेंट अभियान", ev2_desc: "TVS भर्ती अभियान कैंपस में — अंतिम वर्ष के छात्र अभी पंजीकरण करें।",
    ev3_title: "सेमेस्टर परीक्षा परिणाम", ev3_desc: "TVU सेमेस्टर परिणाम जारी — अपने COE पोर्टल पर देखें।",
    popup_dontshow: "आज फिर न दिखाएँ", popup_close: "ठीक है"
  }
};

function applyLanguage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  const cur = document.getElementById('langCurrent');
  if (cur) cur.textContent = lang.toUpperCase();
  document.documentElement.setAttribute('lang', lang);
  try { localStorage.setItem('sss_lang', lang); } catch(e) {}
}

function setLanguage(lang) {
  applyLanguage(lang);
  document.getElementById('langMenu')?.classList.remove('open');
}

function toggleLangMenu() {
  document.getElementById('langMenu')?.classList.toggle('open');
}

document.addEventListener('click', (e) => {
  const sw = document.getElementById('langSwitch');
  if (sw && !sw.contains(e.target)) document.getElementById('langMenu')?.classList.remove('open');
});

document.addEventListener('DOMContentLoaded', () => {
  let savedLang = 'en';
  try { savedLang = localStorage.getItem('sss_lang') || 'en'; } catch(e) {}
  applyLanguage(savedLang);
});

/* ═════════════════════════════════════════════════════════
   DESKTOP / LAPTOP VIEW TOGGLE (mobile devices)
═════════════════════════════════════════════════════════ */
function toggleDesktopView() {
  const body = document.body;
  const isOn = body.classList.toggle('force-desktop-view');
  const meta = document.querySelector('meta[name="viewport"]');
  const icon = document.getElementById('desktopViewIcon');
  const label = document.getElementById('desktopViewLabel');
  const lang = (localStorage.getItem('sss_lang')) || 'en';
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  if (isOn) {
    if (meta) meta.setAttribute('content', 'width=1280');
    if (icon) icon.textContent = '📱';
    if (label) label.textContent = dict.desktop_view_off;
  } else {
    if (meta) meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    if (icon) icon.textContent = '🖥️';
    if (label) label.textContent = dict.desktop_view_on;
  }
  try { localStorage.setItem('sss_desktop_view', isOn ? '1' : '0'); } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  let wantDesktop = false;
  try { wantDesktop = localStorage.getItem('sss_desktop_view') === '1'; } catch(e) {}
  if (wantDesktop && window.innerWidth <= 900) toggleDesktopView();
});

/* ═════════════════════════════════════════════════════════
   EVENTS / NOTIFICATIONS POPUP
═════════════════════════════════════════════════════════ */
async function loadEventsIntoPopup() {
  const body = document.getElementById('eventsPopupBody');
  if (!body) return;
  try {
    const data = await apiRequest('/events');
    if (!data.events || !data.events.length) return; // keep default markup
    body.innerHTML = data.events.map(ev => {
      const d = new Date(ev.event_date);
      const day = d.getDate().toString().padStart(2,'0');
      const mon = d.toLocaleDateString('en-IN', { month: 'short' });
      return `<div class="event-item">
        <div class="event-date-badge"><span class="ed-day">${day}</span><span class="ed-mon">${mon}</span></div>
        <div><div class="event-item-title">${ev.title}</div><div class="event-item-desc">${ev.description}</div></div>
      </div>`;
    }).join('');
  } catch (e) { /* backend not reachable — keep static fallback content */ }
}

function openEventsPopup() {
  loadEventsIntoPopup();
  document.getElementById('eventsPopupOverlay')?.classList.add('open');
}
function closeEventsPopup() {
  document.getElementById('eventsPopupOverlay')?.classList.remove('open');
  const dontShow = document.getElementById('dontShowToday');
  if (dontShow && dontShow.checked) {
    try {
      const today = new Date().toDateString();
      localStorage.setItem('sss_events_popup_dismissed', today);
    } catch(e) {}
  }
}
document.addEventListener('DOMContentLoaded', () => {
  let dismissedToday = false;
  try {
    const dismissed = localStorage.getItem('sss_events_popup_dismissed');
    dismissedToday = dismissed === new Date().toDateString();
  } catch(e) {}
  if (!dismissedToday) {
    setTimeout(() => openEventsPopup(), 1800);
  }
});

/* ═════════════════════════════════════════════════════════
   SCROLL-REVEAL ANIMATIONS (3D / entrance effects)
═════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const selectors = [
    '.feature-card', '.cn-card', '.dept-card', '.testimonial-card',
    '.gallery-item', '.ci-card', '.pstat', '.cn-stat', '.companies-grid > *',
    '.staff-card', '.dept-staff-card', '.hod-card', '.fac-stat',
    '.about-img', '.process-step', '.elig-card', '.exam-card',
    '.dept-tab', '.chairman-photo-wrap', '.chairman-message'
  ];
  const els = document.querySelectorAll(selectors.join(','));
  els.forEach(el => el.classList.add('reveal-up'));

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

// Re-run whenever a page becomes visible (site uses SPA-style showPage)
const _origShowPageForReveal = window.showPage;
if (typeof _origShowPageForReveal === 'function') {
  window.showPage = function(pageId) {
    _origShowPageForReveal(pageId);
    setTimeout(initScrollReveal, 60);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initScrollReveal, 150);
});

/* -- Subtle 3D tilt following the cursor on feature/dept cards -- */
document.addEventListener('mousemove', (e) => {
  const el = e.target.closest('.feature-card, .cn-card, .dept-card, .testimonial-card, .staff-card, .dept-staff-card, .hod-card, .exam-card, .elig-card, .gallery-item');
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-6px)`;
});
document.addEventListener('mouseout', (e) => {
  const el = e.target.closest('.feature-card, .cn-card, .dept-card, .testimonial-card, .staff-card, .dept-staff-card, .hod-card, .exam-card, .elig-card, .gallery-item');
  if (el && !el.contains(e.relatedTarget)) el.style.transform = '';
});
