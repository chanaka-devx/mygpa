const fs=require('fs');
const j=JSON.parse(fs.readFileSync('captures/help-info.json','utf8'));
console.log(JSON.stringify(j,null,2).slice(0,20000));
