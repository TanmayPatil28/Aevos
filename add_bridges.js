const fs = require('fs');

function addBridge(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Find the bottom navigation and inject the Open Full Strategic Planner button.
  const newButton = `
        <Link href="/planner" className="w-full sm:w-auto">
          <PremiumButton variant="primary" icon="strategy" className="w-full justify-between bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-400/50">
            Open Full Strategic Planner
          </PremiumButton>
        </Link>
  `;
  
  // For attendance/page.tsx:
  if (code.includes('Launch Simulator')) {
    code = code.replace(
      /<Link href="\/calculator" className="w-full sm:w-auto">\s*<PremiumButton variant="primary" icon="calculate" className="w-full justify-between">Launch Simulator<\/PremiumButton>\s*<\/Link>/,
      newButton
    );
  }
  
  // For backlog/page.tsx:
  if (code.includes('GPA Calculator')) {
    code = code.replace(
      /<Link href="\/calculator" className="w-full sm:w-auto">\s*<PremiumButton variant="primary" icon="calculate" className="w-full justify-between">GPA Calculator<\/PremiumButton>\s*<\/Link>/,
      newButton
    );
  }

  fs.writeFileSync(filePath, code);
}

addBridge('c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/attendance/page.tsx');
addBridge('c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/backlog/page.tsx');

console.log("Ecosystem bridges added.");
