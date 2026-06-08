const fs = require('fs');
const html = fs.readFileSync('C:/Users/Tanmay/.gemini/antigravity/brain/28fb00fa-d13a-493f-bc44-4391e5e6a5c0/.system_generated/tasks/task-2059.log', 'utf8');
const matches = [...html.matchAll(/"message":"([^"]+)"/g)];
console.log(matches.map(m => m[1]).join('\n'));
