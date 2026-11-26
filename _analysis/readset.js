const fs=require('fs');
const c=fs.readFileSync('chunks/settings-page-f09b0178d56fab60.js','utf8');
console.log(c.slice(0,30000));
