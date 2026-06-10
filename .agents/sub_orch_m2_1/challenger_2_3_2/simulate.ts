import { create } from 'zustand';

// Replicate the logic from dynamicSemesters in app/timeline/page.tsx
function getDynamicSemesters(store: any) {
  const sortedHistory = [...store.semesterHistory].sort((a: any, b: any) => a.semester - b.semester);

  const sems = sortedHistory.map((sh: any, idx: number) => ({
    id: sh.semester,
    title: `Semester ${String(sh.semester).padStart(2, '0')}`,
    status: 'completed',
    sgpa: sh.sgpa.toFixed(2),
    focus: store.courses.filter((c: any) => (c.semester || 1) === sh.semester).map((c: any) => c.name).slice(0, 5)
  }));
  
  const maxHistorySem = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].semester : 0;
  const maxCourseSem = store.courses.reduce((max: number, c: any) => Math.max(max, c.semester || 1), 1);
  
  if (maxCourseSem > maxHistorySem) {
    sems.push({
      id: maxCourseSem,
      title: `Semester ${String(maxCourseSem).padStart(2, '0')}`,
      status: 'current',
      sgpa: 'TBD',
      focus: store.courses.filter((c: any) => (c.semester || 1) === maxCourseSem).map((c: any) => c.name).slice(0, 5)
    });
  }
  
  return sems;
}

// Replicate the emergency fix logic from DashboardClient.tsx
function checkEmergencyFix(store: any) {
    if (store.semesterHistory.length > 12 || store.semesterHistory.some((s: any) => s.semester > 15)) {
        return "NUKED";
    }
    return "OK";
}

// 1. Edge Case: No Authoritative Data
const emptyStore = {
  semesterHistory: [],
  courses: [],
  identity: { hasAuthoritativeData: false }
};

console.log("Empty Store Dynamic Semesters:", getDynamicSemesters(emptyStore).length === 0 ? "Pass (0)" : "Fail");

// 2. Edge Case: Max Course Sem > Max History Sem
const storeWithCurrent = {
  semesterHistory: [{ semester: 1, sgpa: 8.5 }],
  courses: [
    { semester: 1, name: "Math" },
    { semester: 2, name: "Physics" }
  ],
  identity: { hasAuthoritativeData: true }
};

const sems = getDynamicSemesters(storeWithCurrent);
console.log("Store With Current Semester count:", sems.length === 2 ? "Pass (2)" : "Fail");
console.log("Last Semester status:", sems[1].status === 'current' ? "Pass (current)" : "Fail");

// 3. Edge Case: Student with 13 semesters (e.g. Dual Degree with backs)
const dualDegreeStore = {
  semesterHistory: Array.from({ length: 13 }, (_, i) => ({ semester: i + 1, sgpa: 8.0 })),
  courses: [],
  identity: { hasAuthoritativeData: true }
};

console.log("Dual Degree Store (13 semesters) Emergency Fix Result:", checkEmergencyFix(dualDegreeStore) === "NUKED" ? "FAIL (Legitimate data nuked!)" : "PASS");

// 4. Edge Case: Non-contiguous semesters?
const nonContiguousStore = {
    semesterHistory: [{ semester: 1, sgpa: 8.0 }, { semester: 3, sgpa: 9.0 }],
    courses: [{ semester: 1, name: "A" }, { semester: 3, name: "B" }, { semester: 4, name: "C" }],
    identity: { hasAuthoritativeData: true }
};
const ncSems = getDynamicSemesters(nonContiguousStore);
console.log("Non-contiguous store count:", ncSems.length === 3 ? "Pass (3)" : "Fail");
console.log("Non-contiguous last ID:", ncSems[2].id === 4 ? "Pass (4)" : "Fail");

