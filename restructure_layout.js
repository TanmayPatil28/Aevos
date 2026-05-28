const fs = require('fs');
const content = fs.readFileSync('app/calculator/ActiveSimulator.tsx', 'utf8');

const lines = content.split('\n');

// Find boundaries
const idx_start_left_col = lines.findIndex(l => l.includes('LEFT COLUMN: Ledger & Typography'));
const idx_start_left_pane = lines.findIndex(l => l.includes('LEFT PANE: The Bento Grid'));
const idx_start_left_typo = lines.findIndex(l => l.includes('{/* LEFT: Apple-Style Guide Typography */}'));
const idx_start_right_col = lines.findIndex(l => l.includes('RIGHT COLUMN: Summary & Matrix'));
const idx_start_right_pane = lines.findIndex(l => l.includes('RIGHT PANE: Clean Notion-Style Summary'));
const idx_start_right_matrix = lines.findIndex(l => l.includes('{/* RIGHT: Statutory Matrix */}'));
const idx_close_right_col = lines.findIndex(l => l.includes('</div> {/* Closes RIGHT COLUMN (7) */}'));

const beforeLayout = lines.slice(0, idx_start_left_col - 1);
const afterLayout = lines.slice(idx_close_right_col + 1);

// Extract content
const bentoGrid = lines.slice(idx_start_left_pane - 2, idx_start_left_typo).join('\n');
const typography = lines.slice(idx_start_left_typo, idx_start_right_col - 2).join('\n');

const numbersSummary = lines.slice(idx_start_right_pane - 2, idx_start_right_matrix).join('\n');
const matrix = lines.slice(idx_start_right_matrix, idx_close_right_col).join('\n');

const newLayout = `
      {/* =======================================
      ROW 1: BENTO GRID & NUMBERS SUMMARY
      ======================================= */}
      <div className="flex flex-col xl:flex-row gap-8 lg:gap-16 items-start">
        
        {/* LEFT PANE: Bento Grid */}
        <div className="xl:w-[65%] flex flex-col gap-6 relative z-10 w-full">
${bentoGrid}
        </div>
        
        {/* RIGHT PANE: Numbers Summary */}
        <div className="xl:w-[35%] flex flex-col gap-8 xl:sticky xl:top-28 h-fit relative z-10 w-full">
${numbersSummary}
        </div>
        
      </div>

      {/* =======================================
      ROW 2: TYPOGRAPHY & STATUTORY MATRIX
      ======================================= */}
      <div className="flex flex-col xl:flex-row gap-8 lg:gap-16 items-start mt-24">
        
        {/* LEFT PANE: Typography */}
        <div className="xl:w-[35%] flex flex-col gap-16 relative z-10 w-full xl:sticky xl:top-28 h-fit">
${typography}
        </div>
        
        {/* RIGHT PANE: Statutory Matrix */}
        <div className="xl:w-[65%] w-full relative z-10">
${matrix}
        </div>
        
      </div>
`;

const newContent = [...beforeLayout, newLayout, ...afterLayout].join('\n');
fs.writeFileSync('app/calculator/ActiveSimulator.tsx', newContent);
console.log('Restructured successfully');
