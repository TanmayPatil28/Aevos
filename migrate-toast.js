const fs = require('fs');
const path = require('path');

const files = [
  "app/(workspace)/calculator/ActiveSimulator.tsx",
  "app/(workspace)/calculator/ManualCalculator.tsx",
  "app/(workspace)/focus/page.tsx",
  "app/(workspace)/multi-semester/page.tsx",
  "app/(workspace)/placement/components/DynamicRoadmapModal.tsx",
  "app/(workspace)/placement/page.tsx",
  "app/(workspace)/planner/page.tsx",
  "components/auth/OAuthProviders.tsx",
  "components/auth/UnifiedAuthForm.tsx",
  "components/placement/CompanyLedgerRow.tsx",
  "components/placement/DynamicIsland.tsx",
  "components/placement/PlacementHealthMeter.tsx",
  "components/placement/PriorityActionItems.tsx",
  "components/placement/ResumeUploadTarget.tsx",
  "components/DocumentVault.tsx",
  "components/JarvisCommandCenter.tsx"
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
      console.log("File not found: ", fullPath);
      continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Handle default import
  content = content.replace(/import\s+toast\s+from\s+['"]react-hot-toast['"];?/g, 'import { toast } from "sonner";');
  
  // Handle named import
  content = content.replace(/import\s*{\s*toast\s*}\s*from\s+['"]react-hot-toast['"];?/g, 'import { toast } from "sonner";');
  
  fs.writeFileSync(fullPath, content);
  console.log("Updated", file);
}
console.log("Migration script finished.");
