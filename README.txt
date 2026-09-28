SSS COLLEGE — CLASS NOTES DAILY WORKFLOW
==========================================

HOW TO ADD NOTES (DAILY)
-------------------------
Step 1: Save the PDF file
   Place it in the correct department folder:
     notes/bsc-cs/your-file.pdf
     notes/bca/your-file.pdf
     notes/bcom/your-file.pdf
     ... (14 departments available)

Step 2: Open script.js and add ONE entry to the PDF_NOTES array
   Find the line that says "// ADD NEW NOTES ABOVE THIS LINE"
   Paste this above it and fill in the details:

   { id:'pn__',
     dept:'bsc-cs',        // folder name
     year:'I',             // "I" | "II" | "III"
     sem:'I',              // "I" to "VI"
     subject:'Subject Name',
     title:'Lecture topic or assignment title',
     type:'Lecture Notes', // see types below
     staffName:'Staff Name',
     date:'2026-07-15',    // today's date YYYY-MM-DD
     fileUrl:'notes/bsc-cs/your-file.pdf',
     size:'1.2 MB' },

Step 3: Save and refresh the page
   The note appears instantly with working View + Download buttons.

NO SERVER, DATABASE OR LOGIN NEEDED.


NOTE TYPES
----------
• Lecture Notes     — classroom lecture PDFs
• Assignment        — homework and practice sheets
• Important Q&A     — exam preparation / key questions
• Formula Sheet     — formulae and cheat sheets
• Reference         — textbooks, guides, supplementary material


AVAILABLE DEPARTMENTS (folder names)
------------------------------------
bsc-cs, bca, bsc-data-science, bsc-ai, mathematics, english,
bsc-chemistry, bcom, bcom-ca, bba, ba-tamil, ba-defence, msc-cs, mcom


DATE FILTER
-----------
Students can filter notes by date:
  Today       — notes added today
  This Week   — notes added in the last 7 days
  This Month  — notes added in the last 30 days


TIPS
----
• Use unique IDs: pn01, pn02, pn03... (never reuse an ID)
• date format must be YYYY-MM-DD (e.g. 2026-07-15)
• You can test locally by opening index.html in a browser
• No server needed — everything runs as static files
