const fs = require('fs');

const path = 'c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/(workspace)/planner/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// The file still has `activeTab === 'strategy' ? (`. Let's find it and remove it.
// We also need to remove the `<AnimatePresence mode="wait">` and the matching braces/tags at the end.

const strToFind1 = `<AnimatePresence mode="wait">
            {activeTab === 'strategy' ? (
              <motion.div key="strategy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>`;

const strToReplace1 = `<div className="w-full flex flex-col gap-16 mt-8">`;

if (code.includes(strToFind1)) {
  code = code.replace(strToFind1, strToReplace1);
} else {
  // Try regex if exact match fails
  code = code.replace(/<AnimatePresence mode="wait">\s*\{activeTab === 'strategy' \? \(\s*<motion\.div key="strategy"[^>]*>/, strToReplace1);
}

// Now let's fix the bottom part.
// The file has a dangling `</motion.div>` and `)}` around line 905.
// Let's remove the extra closing tags and the activeTab conditional closing.

// We look for:
//             </motion.div>
//             )}
//           </motion.div>

const bottomRegex = /<\/motion\.div>\s*\)\}\s*<\/motion\.div>/;
code = code.replace(bottomRegex, `</div>`);

fs.writeFileSync(path, code);
console.log("Cleanup complete");
