"use client";

import { useDomainStore } from "@/stores/os/domainStore";

export default function ReviewImport({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: () => void, 
  onCancel: () => void 
}) {
  const { addTerm, setTermCourses } = useDomainStore();

  const handleConfirm = () => {
    // Generate a unique ID for the mocked term
    const newTermId = `term_import_${Date.now()}`;
    
    // 1. Create a new term
    addTerm({
      id: newTermId,
      name: "Semester 3 (Imported)",
      order: 3,
      status: "COMPLETED"
    });

    // 2. Add mocked courses
    setTermCourses(newTermId, [
      { id: `c_${Date.now()}_1`, termId: newTermId, code: "CS201", name: "Data Structures", credits: 4, grade: "A", gradePoints: 8 },
      { id: `c_${Date.now()}_2`, termId: newTermId, code: "CS202", name: "Algorithms", credits: 4, grade: "B+", gradePoints: 7 },
      { id: `c_${Date.now()}_3`, termId: newTermId, code: "MA201", name: "Linear Algebra", credits: 3, grade: "O", gradePoints: 10 },
      { id: `c_${Date.now()}_4`, termId: newTermId, code: "CS203", name: "Computer Networks", credits: 3, grade: "B", gradePoints: 6 },
    ]);

    // Transition to success state
    onConfirm();
  };

  return (
    <div className="w-full bg-[#1D1D1F] border border-white/5 rounded-[32px] overflow-hidden">
      
      {/* Review Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-800/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-indigo-400">verified</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Review Imported Data</h2>
        </div>
        <p className="text-sm text-slate-400">
          We found <strong>4 courses</strong> in this document. Please review the grades below before saving them to your Ledger.
        </p>
      </div>

      {/* Mocked Data Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[500px]">
          <thead className="bg-slate-800/40 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-medium">Course Code</th>
              <th className="px-6 py-3 font-medium">Course Name</th>
              <th className="px-6 py-3 font-medium text-right">Credits</th>
              <th className="px-6 py-3 font-medium text-center">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr className="hover:bg-slate-800/20">
              <td className="px-6 py-3 text-slate-200 font-mono">CS201</td>
              <td className="px-6 py-3 text-slate-300">Data Structures</td>
              <td className="px-6 py-3 text-slate-300 text-right">4</td>
              <td className="px-6 py-3 text-emerald-400 font-bold text-center">A</td>
            </tr>
            <tr className="hover:bg-slate-800/20">
              <td className="px-6 py-3 text-slate-200 font-mono">CS202</td>
              <td className="px-6 py-3 text-slate-300">Algorithms</td>
              <td className="px-6 py-3 text-slate-300 text-right">4</td>
              <td className="px-6 py-3 text-emerald-400 font-bold text-center">B+</td>
            </tr>
            <tr className="hover:bg-slate-800/20">
              <td className="px-6 py-3 text-slate-200 font-mono">MA201</td>
              <td className="px-6 py-3 text-slate-300">Linear Algebra</td>
              <td className="px-6 py-3 text-slate-300 text-right">3</td>
              <td className="px-6 py-3 text-emerald-400 font-bold text-center">O</td>
            </tr>
            <tr className="hover:bg-slate-800/20">
              <td className="px-6 py-3 text-slate-200 font-mono">CS203</td>
              <td className="px-6 py-3 text-slate-300">Computer Networks</td>
              <td className="px-6 py-3 text-slate-300 text-right">3</td>
              <td className="px-6 py-3 text-emerald-400 font-bold text-center">B</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-800/20 border-t border-slate-800 flex items-center justify-end gap-3">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
        >
          Looks Good, Save to Ledger
        </button>
      </div>

    </div>
  );
}
