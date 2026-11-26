const fs=require('fs');
for (const f of ['analytics-page-f365cb522aa0ec9b.js','settings-page-f09b0178d56fab60.js','feedback-page-a32606098843329d.js']) {
  const c=fs.readFileSync('chunks/'+f,'utf8');
  console.log('\n\n########## '+f+' ('+c.length+') ##########\n');
  console.log(c.slice(0, 22000));
}
