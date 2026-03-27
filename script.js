
function checkResult() {
  const examNo = document.getElementById('examNo').value.trim();
  const dob = document.getElementById('dob').value;

  fetch('students.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.split('\n');
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        const csvDob = row[1].trim();
        if (row[0].trim() === examNo && formatDob(csvDob) === dob) {
          document.getElementById('result').innerHTML = `
            Name: ${row[2]}<br>
            BIO: ${row[3]}<br>
            PHY: ${row[4]}<br>
            Chem: ${row[5]}
          `;
          return;
        }
      }
      document.getElementById('result').innerHTML = 'No match found';
    });
}
function formatDob(dob){
    const [d,m,y]=dob.split('/');
    return '${y}-${m}-${d}'
}