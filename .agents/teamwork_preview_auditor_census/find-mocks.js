const fs = require('fs');
const path = require('path');

const dir = 'components';
const pattern = /mock|demo|simulate|for visual representation/i;

function walk(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

const files = walk(dir);
const results = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      results.push({
        file: file.replace(/\\/g, '/'),
        line: index + 1,
        content: line.trim()
      });
    }
  });
});

fs.writeFileSync('.agents/teamwork_preview_auditor_census/find-mocks-results.json', JSON.stringify(results, null, 2));
console.log("Done! Wrote " + results.length + " lines of results.");
