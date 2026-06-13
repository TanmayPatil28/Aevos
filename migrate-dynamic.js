const fs = require('fs');
const path = require('path');

const files = [
  "app/(workspace)/placement/page.tsx",
  "components/placement/CompanyLedgerRow.tsx",
  "components/placement/DynamicIsland.tsx",
  "components/placement/PlacementHealthMeter.tsx",
  "components/placement/PriorityActionItems.tsx"
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/import\(['"]react-hot-toast['"]\)/g, 'import("sonner")');
  fs.writeFileSync(fullPath, content);
}
console.log("Dynamic imports migrated.");
