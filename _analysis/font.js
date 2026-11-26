const fs=require('fs');
const c=fs.readFileSync('site.css','utf8');
const i=c.indexOf('Geist');
console.log('idx', i);
console.log(c.slice(Math.max(0,i-1000), i+2000));
