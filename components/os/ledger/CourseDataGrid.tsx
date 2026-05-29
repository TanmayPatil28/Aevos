"use client";

import { useDomainStore, OSCourse } from "@/stores/os/domainStore";
import { useUIStore } from "@/stores/os/uiStore";

// Standard 10-point scale for MVP
const GRADES = [
  { label: "O (10)", value: "O", points: 10 },
  { label: "A+ (9)", value: "A+", points: 9 },
  { label: "A (8)", value: "A", points: 8 },
  { label: "B+ (7)", value: "B+", points: 7 },
  { label: "B (6)", value: "B", points: 6 },
  { label: "C (5)", value: "C", points: 5 },
  { label: "F (0)", value: "F", points: 0 },
];

export default function CourseDataGrid({ termId, initialCourses }: { termId: string, initialCourses: OSCourse[] }) {
  const { updateCourse, addCourse, deleteCourse } = useDomainStore();
  const { setInspectorEntity } = useUIStore();

  const handleGradeChange = (id: string, gradeValue: string) => {
    const gradeObj = GRADES.find(g => g.value === gradeValue);
    updateCourse(id, { 
      grade: gradeValue, 
      gradePoints: gradeObj ? gradeObj.points : 0 
    });
  };

  const handleAddRow = () => {
    addCourse({
      id: `course_${Date.now()}`,
      termId,
      code: "",
      name: "",
      credits: 3,
      grade: "",
      gradePoints: 0
    });
  };

  return (
    <div className="bg-[#1D1D1F] border border-white/5 rounded-[24px] overflow-x-auto overflow-y-hidden">
      <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
        <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 font-medium w-1/5">Course Code</th>
            <th className="px-4 py-3 font-medium w-2/5">Course Name</th>
            <th className="px-4 py-3 font-medium w-1/5">Credits</th>
            <th className="px-4 py-3 font-medium w-1/5">Grade</th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {initialCourses.map((course) => (
            <tr key={course.id} className="group hover:bg-slate-800/20 transition-colors focus-within:bg-slate-800/40">
              <td className="p-0">
                <input
                  type="text"
                  value={course.code}
                  onChange={(e) => updateCourse(course.id, { code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS101"
                  className="w-full bg-transparent px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500 font-mono"
                />
              </td>
              <td className="p-0">
                <input
                  type="text"
                  value={course.name || ""}
                  onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                  placeholder="Course Title"
                  className="w-full bg-transparent px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500"
                />
              </td>
              <td className="p-0">
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={course.credits || ""}
                  onChange={(e) => updateCourse(course.id, { credits: parseInt(e.target.value) || 0 })}
                  placeholder="Credits"
                  className="w-full bg-transparent px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500"
                />
              </td>
              <td className="p-0">
                <select
                  value={course.grade || ""}
                  onChange={(e) => handleGradeChange(course.id, e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-500">Select Grade</option>
                  {GRADES.map(g => (
                    <option key={g.value} value={g.value} className="bg-slate-900 text-slate-200">{g.label}</option>
                  ))}
                </select>
              </td>
              <td className="p-0 text-center">
                <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setInspectorEntity({ type: "COURSE", id: course.id })}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 transition-all rounded outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500"
                    tabIndex={-1}
                    title="Open Details"
                  >
                    <span className="material-symbols-outlined text-[18px]">info</span>
                  </button>
                  <button 
                    onClick={() => deleteCourse(course.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-all rounded outline-none focus:ring-1 focus:ring-inset focus:ring-rose-500"
                    tabIndex={-1}
                    title="Delete Course"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          
          {/* Add Row Button */}
          <tr>
            <td colSpan={5} className="p-0">
              <button 
                onClick={handleAddRow}
                className="w-full flex items-center gap-2 px-4 py-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 transition-colors text-sm font-medium focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Course
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
