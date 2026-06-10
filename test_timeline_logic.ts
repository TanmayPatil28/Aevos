const courses1: any[] = [];
const activeCourses1 = courses1.filter(c => (c.name && c.name.trim() !== "") || (c.code && c.code.trim() !== ""));
const maxCourseSem1 = activeCourses1.length > 0 ? activeCourses1.reduce((max, c) => Math.max(max, c.semester || 1), 0) : 0;
console.log("Empty courses maxCourseSem:", maxCourseSem1);

const courses2 = [{ name: "Math", semester: undefined }];
const activeCourses2 = courses2.filter(c => (c.name && c.name.trim() !== "") || (c.code && c.code.trim() !== ""));
const maxCourseSem2 = activeCourses2.length > 0 ? activeCourses2.reduce((max, c) => Math.max(max, c.semester || 1), 0) : 0;
console.log("1 course no semester maxCourseSem:", maxCourseSem2);

