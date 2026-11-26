const fs=require('fs');
const c=fs.readFileSync('chunks/dash-page-09f6db1ee77b28a6.js','utf8');
for (const t of ['Create Your Own','Form Default list','Add New Module','module name','Create Module']) {
  const i=c.indexOf(t);
  console.log('=== '+t+' @ '+i+' ===');
  if(i>=0) console.log(c.slice(Math.max(0,i-1500), i+1500));
}
