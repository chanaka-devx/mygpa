const fs=require('fs');
const c=fs.readFileSync('chunks/analytics-page-f365cb522aa0ec9b.js','utf8');
console.log(c.slice(0,30000));
