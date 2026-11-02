HOW TO ADD REAL PDF CLASS NOTES
================================

1. Put the PDF file inside the matching department folder, e.g.:
     notes/bsc-cs/data-structures-unit4.pdf

2. Open script.js and find the PDF_NOTES array near the top
   (search for "PDF CLASS NOTES"). Add one line like:

   { id:'pn16', dept:'bsc-cs', year:'II', sem:'III',
     subject:'Data Structures',
     title:'Unit 4 - Trees & Graphs',
     type:'Lecture Notes', staffName:'P.Monisha',
     date:'2026-07-14',
     fileUrl:'notes/bsc-cs/data-structures-unit4.pdf',
     size:'1.4 MB' },

   - id        : must be unique (pn16, pn17, ...)
   - dept      : must match a department id used in the filter dropdown
   - year      : "I" | "II" | "III"
   - sem       : "I" to "VI"
   - type      : "Lecture Notes" | "Assignment" | "Important Q&A"
                 | "Formula Sheet" | "Reference"
   - fileUrl   : the path to the PDF you just uploaded

3. Save and reload the Class Notes page - the new PDF appears
   automatically, with working View + Download buttons.

No server, database or login is required for this to work.
The sample entries currently in PDF_NOTES point to files that
don't exist yet - replace fileUrl with your real PDFs before
going live, or remove the sample rows you don't need.
