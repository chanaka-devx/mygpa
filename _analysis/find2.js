const fs=require('fs');
const c=fs.readFileSync('chunks/dash-page-09f6db1ee77b28a6.js','utf8');
const i=c.indexOf('Semester 1');
console.log(c.slice(Math.max(0,i-1200), i+400));
