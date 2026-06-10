export function getQueryForProfile(academicProfile: any) {
  let query = "software engineering tech internships summer";
  const programme = academicProfile?.academic?.programme || "";
  const branch = academicProfile?.academic?.branch || "";
  if (programme || branch) {
    query = `${branch} ${programme} internships summer`.trim();
  } else if (academicProfile?.skills && academicProfile?.major) {
    const skillsArr = Array.isArray(academicProfile.skills) ? academicProfile.skills : [academicProfile.skills];
    query = `${academicProfile.major} ${skillsArr.slice(0, 2).join(" ")} internships summer`.trim();
  }
  return query;
}

const tests = [
  { name: "Empty", profile: {}, expected: "software engineering tech internships summer" },
  { name: "Undefined", profile: undefined, expected: "software engineering tech internships summer" },
  { name: "Skills as string", profile: { major: "CS", skills: "React, Node, TS" }, expected: "CS React, Node, TS internships summer" },
  { name: "Skills as array", profile: { major: "CS", skills: ["React", "Node", "TS"] }, expected: "CS React Node internships summer" },
  { name: "Skills undefined", profile: { major: "CS" }, expected: "software engineering tech internships summer" },
  { name: "Academic has branch", profile: { academic: { branch: "IT" } }, expected: "IT  internships summer" },
];

let failed = false;
for (const t of tests) {
  try {
    const res = getQueryForProfile(t.profile);
    if (res !== t.expected) {
      console.log(`❌ FAILED [${t.name}]: expected "${t.expected}", got "${res}"`);
      failed = true;
    } else {
      console.log(`✅ Passed [${t.name}]: got "${res}"`);
    }
  } catch(e) {
    console.log(`❌ CRASHED [${t.name}]:`, e);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("All logic tests passed!");
