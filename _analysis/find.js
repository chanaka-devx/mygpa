const fs=require('fs');
const c=fs.readFileSync('chunks/dash-page-09f6db1ee77b28a6.js','utf8');
for (const t of ['Semester 4','Semester 8','Industrial Law','Virtual and Augmented','id:25','Programme']) {
  const i=c.indexOf(t);
  console.log('=== '+t+' @ '+i+' ===');
  if(i>=0) console.log(c.slice(Math.max(0,i-500), i+3000));
}
