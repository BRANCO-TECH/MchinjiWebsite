async function loadCSV(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    let text = await response.text();
    
    // Fix: Remove Windows carriage returns to prevent blank cells on PC
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
    // CHANGED: Removed <div class="card"> from error message so it doesn't get a green border
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
        <h2 style="text-align:center;">Your examination results</h2>
        
        <div class="report-card-inner">
          <div style="text-align: center;">
            <h2 style="margin-top: 0;">REPORT CARD</h2>
            <p><strong>${schoolName}</strong></p>
          </div>
          
          <!-- Flexbox for Top Left and Top Right -->
          <div style="display: flex; justify-content: space-between; margin-top: 15px; margin-bottom: 15px; text-align: left; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <p style="margin: 2px 0;"><strong>Name:</strong> ${cols[nameIndex] || '-'}</p>
              <p style="margin: 2px 0;"><strong>Form:</strong> ${cols[formIndex]} &nbsp; <strong>Term:</strong> ${cols[termIndex]} &nbsp; <strong>Year:</strong> ${cols[yearIndex]}</p>
            </div>
            <div style="flex: 1; min-width: 200px; text-align: right;">
              <p style="margin: 2px 0;"><strong>POSITION IN CLASS:</strong> ${cols[positionIndex] || '-'}</p>
              <p style="margin: 2px 0;"><strong>REMARKS:</strong> ${cols[remarksIndex] || '-'}</p>
            </div>
          </div>

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
                    <td>${cols[baseIndex] || '-'}</td>
                    <td>${cols[baseIndex + 1] || '-'}</td>
                    <td>${cols[baseIndex + 2] || '-'}</td>
                    <td>${cols[baseIndex + 3] || '-'}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>
          <br>
          <div style="text-align: left;">
            <p style="margin: 2px 0;"><strong>HEADTEACHER:</strong> ${cols[headTeacherIndex] || '-'}</p>
            <p style="margin: 2px 0;"><strong>BANK DETAILS FOR FEES PAYMENT:</strong> ${cols[bankDetailsIndex] || '-'}</p>
            <p style="margin: 2px 0;"><strong>NEXT TERM OPENS ON:</strong> ${cols[nextTermIndex] || '-'}</p>
          </div>
        </div>
        
        <button id="downloadBtn" class="green-btn" style="margin-top: 15px;">Download Report Card</button>
      `;
      
      document.getElementById('result').innerHTML = html;
      document.getElementById('options').style.display = 'none';

      document.getElementById('downloadBtn').addEventListener('click', () => {
        const reportCard = document.querySelector('.report-card-inner');
        html2pdf().from(reportCard).save('report_card.pdf');
      });

      found = true;
      return;
    }
  }
  
  if (!found) {
    // CHANGED: Removed <div class="card"> from error message
    document.getElementById('result').innerHTML = '<p style="color:red; text-align:center;">No matching record found or incorrect password</p>';
  }
}