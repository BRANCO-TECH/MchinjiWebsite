const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js';
document.head.appendChild(script);

let currentFormType = '';

document.addEventListener('DOMContentLoaded', () => {
  const daySchoolBtn = document.getElementById('daySchoolBtn');
  const odlBtn = document.getElementById('odlBtn');
  const checkResultBtn = document.getElementById('checkResultBtn');
  
  if (daySchoolBtn && odlBtn && checkResultBtn) {
    daySchoolBtn.addEventListener('click', showDaySchoolOptions);
    odlBtn.addEventListener('click', showODLOptions);
    checkResultBtn.addEventListener('click', checkResult);
  }
});

function showDaySchoolOptions() {
  currentFormType = 'Day';
  const options = ['Form1', 'Form2', 'Form3', 'Form4'];
  populateOptions(options);
}

function showODLOptions() {
  currentFormType = 'ODL';
  const options = ['Form1ODL', 'Form2ODL', 'Form3ODL', 'Form4ODL'];
  populateOptions(options);
}

function populateOptions(options) {
  document.getElementById('options').style.display = 'block';
  const select = document.getElementById('form');
  select.innerHTML = '<option value="" disabled selected>-- Choose Form --</option>';
  
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.text = option.replace('ODL', ' ODL');
    select.add(opt);
  });
}

async function loadCSV(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    let text = await response.text();
    
    text = text.replace(/\r/g, ''); 
    const rows = text.split('\n');
    const data = [];
    
    for (let row of rows) {
      const cols = row.split(',');
      if (cols.length > 1 && cols.some(col => col.trim() !== '')) {
        data.push(cols);
      }
    }
    return data;
  } catch (e) {
    console.error(e);
    document.getElementById('result').innerHTML = `<p style="color:red; text-align:center;">Error loading data: ${e.message}</p>`;
    return [];
  }
}

async function fillReportCard(form, examNo, password) {
  const csvUrl = `${form}.csv`;
  const data = await loadCSV(csvUrl);
  let found = false;
  
  for (let row of data.slice(2)) {
    const cols = row;
    
    if (cols.length < 50) continue;
    
    // FIX 1: CASE INSENSITIVE CHECK (Exam No)
    if (cols[0]?.trim().toLowerCase() === examNo.trim().toLowerCase() && cols[14]?.trim() === password.trim()) {
      const nameIndex = 2; 
      const formIndex = 3; 
      const termIndex = 4; 
      const yearIndex = 5; 
      const positionIndex = 6; 
      const bmIndex = 7; 
      const remarksIndex = 8; 
      const gradingSystemIndex = 9; 
      const headTeacherIndex = 10; 
      const uniformIndex = 11; 
      const bankDetailsIndex = 12; 
      const nextTermIndex = 13; 
      
      let aggregateLabel = '';
      if (form.includes('Form1') || form.includes('Form2')) {
        aggregateLabel = 'Aggregate Grade';
      } else {
        aggregateLabel = 'Aggregate Points';
      }
      
      const subjects = ['AGRI', 'BIBLE', 'BIO', 'CHE', 'CHI', 'HEC', 'ENG', 'HIS', 'GEO', 'S/LF', 'MAT', 'PHY', 'COM'];
      const schoolName = form.includes('ODL') ? 'MCHINJI SECONDARY SCHOOL ODL' : 'MCHINJI SECONDARY SCHOOL';
      const roleLabel = form.includes('ODL') ? 'COORDINATOR' : 'HEADTEACHER';
      
      let html = `
        <h2 style="text-align:center; font-size: 16px;">Your examination results</h2>
        
        <div class="report-card-inner" style="box-sizing: border-box;">
          <div style="text-align: center; margin-bottom: 10px;">
            <h2 style="margin: 0; font-size: 18px;">REPORT CARD</h2>
            <p style="margin: 2px 0; font-size: 13px;"><strong>${schoolName}</strong></p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px; text-align: left; font-size: 12px; flex-wrap: wrap;">
            <div style="flex: 1; padding-right: 5px; min-width: 200px;">
              <p style="margin: 1px 0;"><strong>Name:</strong> ${cols[nameIndex] || '-'}</p>
              <p style="margin: 1px 0;"><strong>Form:</strong> ${cols[formIndex]} <strong>Term:</strong> ${cols[termIndex]} <strong>Year:</strong> ${cols[yearIndex]}</p>
            </div>
            <div style="flex: 1; text-align: right; padding-left: 5px; min-width: 200px;">
              <p style="margin: 1px 0;"><strong>Position In Class:</strong> ${cols[positionIndex] || '-'}</p>
              <p style="margin: 1px 0;"><strong>${aggregateLabel}:</strong> ${cols[bmIndex] || '-'}</p>
              <p style="margin: 1px 0;"><strong>Remarks:</strong> ${cols[remarksIndex] || '-'}</p>
            </div>
          </div>

          <!-- FIX 2: OPTIMIZED TABLE FOR MOBILE -->
          <div style="overflow-x: auto; width: 100%;">
            <table border="1" style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10px;">
              <tr>
                <!-- Adjusted widths to prioritize Subject and Remarks -->
                <th style="padding: 4px 2px; width: 25%; word-wrap: break-word;">SUBJECT</th>
                <th style="padding: 4px 2px; width: 20%; word-wrap: break-word;">AGGREGATE (%)</th>
                <th style="padding: 4px 2px; width: 15%; word-wrap: break-word;">GRADE</th>
                <th style="padding: 4px 2px; width: 15%; word-wrap: break-word;">POSITION</th>
                <th style="padding: 4px 2px; width: 25%; word-wrap: break-word;">REMARKS</th>
              </tr>
              ${subjects.map((subject, i) => {
                const baseIndex = 15 + (i * 4);
                return `
                  <tr>
                    <!-- FIX 3: FORCED TEXT WRAPPING AND REDUCED PADDING -->
                    <td style="padding: 2px 1px; text-align: left; padding-left: 4px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${subject}</td>
                    <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${cols[baseIndex] || '-'}</td>
                    <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${cols[baseIndex + 1] || '-'}</td>
                    <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${cols[baseIndex + 2] || '-'}</td>
                    <td style="padding: 2px 1px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${cols[baseIndex + 3] || '-'}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>
          
          <div style="text-align: left; font-size: 11px; margin-top: 10px; word-wrap: break-word;">
            <p style="margin: 2px 0;"><strong>GRADING SYSTEM:</strong> ${cols[gradingSystemIndex] || '-'}</p>
            <p style="margin: 2px 0;"><strong>${roleLabel}:</strong> ${cols[headTeacherIndex] || '-'}</p>
            <p style="margin: 2px 0;"><strong>UNIFORM:</strong> ${cols[uniformIndex] || '-'}</p>
            <p style="margin: 2px 0;"><strong>BANK DETAILS:</strong> ${cols[bankDetailsIndex] || '-'}</p>
            <p style="margin: 2px 0;"><strong>NEXT TERM OPENS:</strong> ${cols[nextTermIndex] || '-'}</p>
          </div>
        </div>
        
        <button id="downloadBtn" class="green-btn" style="margin-top: 15px; width: 100%;">Download Report Card</button>
      `;
      
      document.getElementById('result').innerHTML = html;
      document.getElementById('options').style.display = 'none';

      document.getElementById('downloadBtn').addEventListener('click', () => {
        const element = document.querySelector('.report-card-inner');
        
        const opt = {
          margin:       [10, 10, 10, 10],
          filename:     'report_card.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
      });

      found = true;
      return;
    }
  }
  
  if (!found) {
    document.getElementById('result').innerHTML = '<p style="color:red; text-align:center;">No matching record found or incorrect password</p>';
  }
}

function checkResult() {
  const form = document.getElementById('form').value;
  const examNo = document.getElementById('examNo').value.trim();
  const password = document.getElementById('password').value.trim();
  
  if(!form || !examNo || !password) {
    alert("Please fill in all fields.");
    return;
  }
  
  fillReportCard(form, examNo, password);
}
