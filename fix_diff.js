const fs = require('fs');
const diff = fs.readFileSync('diff.txt', 'utf16le');

const files = diff.split(/\r?\ndiff --git /);

for (let i = 0; i < files.length; i++) {
    const fileDiff = files[i];
    const lines = fileDiff.split(/\r?\n/);
    const aPathLine = lines.find(l => l.startsWith('--- a/'));
    if (!aPathLine) continue;
    
    const filePath = aPathLine.substring(6); // remove '--- a/'
    if (!filePath.endsWith('.tsx')) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (let j = 0; j < lines.length; j++) {
        if (lines[j].startsWith('-') && !lines[j].startsWith('--- ')) {
            const deletedLine = lines[j].substring(1);
            if (j + 1 < lines.length && lines[j+1].startsWith('+') && !lines[j+1].startsWith('+++ ')) {
                const addedLine = lines[j+1].substring(1);
                
                const oldMatch = deletedLine.match(/(border-[tblryx]|h-px|w-px|divide-[xy])/);
                const newMatch = addedLine.match(/\s+(?:border|bg|divide)-white\/20/);
                
                if (oldMatch && newMatch) {
                    let fixedLine = addedLine.replace(/\s+((?:border|bg|divide)-white\/20)/, ' ' + oldMatch[1] + ' $1');
                    
                    if (content.includes(addedLine)) {
                        content = content.replace(addedLine, fixedLine);
                        modified = true;
                    } else if (content.includes(addedLine.trim())) {
                        // try replacing the trimmed version if the line ending is tricky
                        content = content.replace(addedLine.trim(), fixedLine.trim());
                        modified = true;
                    }
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
}
