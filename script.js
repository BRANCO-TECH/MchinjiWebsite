


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
  document.getElementById('instruction').style.display='block';
}

function showODLOptions() {
  currentFormType = 'ODL';
  const options = ['Form1ODL', 'Form2ODL', 'Form3ODL', 'Form4ODL'];
  populateOptions(options);
  document.getElementById('instruction').style.display='block';
}

function populateOptions(options) {
  document.getElementById('options').style.display = 'block';
  const select = document.getElementById('form');
  select.innerHTML = '';
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
    const text = await response.text();
    return text.split('\n').map(row => row.split(','));
  } catch (e) {
    console.error(e);
    document.getElementById('result').innerHTML = `Error: ${e.message}`;
    return [];
  }
}

async function fillReportCard(form, examNo, password) {
  const csvUrl = `${form}.csv`;
  const data = await loadCSV(csvUrl);
  let found = false;
  for (let row of data.slice(2)) {
    const cols = row;
    if (cols.length < 64) continue;
    if (cols[1]?.trim() === examNo.trim() && password === "123456") {
      const nameIndex = 9;
      const formIndex = 0;
      const termIndex = 3;
      const yearIndex = 4;
      const headTeacherIndex = 5;
      const bankDetailsIndex = 6;
      const nextTermIndex = 7;
      const positionIndex = 62;
      const remarksIndex = 63;
      const subjects = ['AGRI', 'BIBLE', 'BIO', 'CHE', 'CHI', 'HFC', 'ENG', 'HIS', 'GEO', 'S/LF', 'MAT', 'PHY', 'COM'];
      const schoolName = form.includes('ODL') ? 'MCHINJI SECONDARY SCHOOL ODL' : 'MCHINJI SECONDARY SCHOOL';
      let html = `
        <h2>Your examination results</h2>
        <div class="card">
          <div style="text-align: center;">
            <h2>REPORT CARD</h2>
            <p>${schoolName}</p>
          </div>
          <p><strong>Name:</strong> ${cols[nameIndex]}</p>
          <p><strong>Form:</strong> ${cols[formIndex]} <strong>Term:</strong> ${cols[termIndex]} <strong>Year:</strong> ${cols[yearIndex]}</p>
          <p><strong>POSITION IN CLASS:</strong> ${cols[positionIndex]}</p>
          <p><strong>REMARKS:</strong> ${cols[remarksIndex]}</p>
          <div style="overflow-x: auto;">
            <table border="1">
              <tr>
                <th>SUBJECT</th>
                <th>AGGREGATE (%)</th>
                <th>GRADE</th>
                <th>POSITION</th>
                <th>REMARKS</th>
              </tr>
              ${subjects.map((subject, i) => {
                const baseIndex = 10 + (i * 4);
                return `
                  <tr>
                    <td>${subject}</td>
                    <td>${cols[baseIndex]}</td>
                    <td>${cols[baseIndex + 1]}</td>
                    <td>${cols[baseIndex + 2]}</td>
                    <td>${cols[baseIndex + 3]}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>
          <p><strong>HEADTEACHER:</strong> ${cols[headTeacherIndex]}</p>
          <p><strong>BANK DETAILS FOR FEES PAYMENT:</strong> ${cols[bankDetailsIndex]}</p>
          <p><strong>NEXT TERM OPENS ON:</strong> ${cols[nextTermIndex]}</p>
        </div>
        <button id="downloadBtn" class="green-btn">Download Report Card</button>
      `;
      document.getElementById('result').innerHTML = html;
      document.getElementById('options').style.display = 'none';

      document.getElementById('downloadBtn').addEventListener('click', () => {
        const reportCard = document.querySelector('.card');
        const opt = {
          margin: 0.5,
          filename: 'report_card.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(reportCard).set(opt).save();
      });

      found = true;
      return;
    }
  }
  if (!found) document.getElementById('result').innerHTML = '<div class="card">No matching record found or incorrect password</div>';
}

function checkResult() {
  const form = document.getElementById('form').value;
  const examNo = document.getElementById('examNo').value.trim();
  const password = document.getElementById('password').value.trim();
  fillReportCard(form, examNo, password);
}



