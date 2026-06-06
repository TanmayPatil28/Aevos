export interface SyllabusTopic {
  name: string;
  weightage: number; // Percentage
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export class HistoricalAnalyticsEngine {
  static generateTopics(courseName: string): SyllabusTopic[] {
    const name = courseName.toLowerCase();
    
    // Procedural generation based on keywords
    if (name.includes("data structure") || name.includes("dsa")) {
      return [
        { name: "Trees & Graphs", weightage: 35, difficulty: "HARD" },
        { name: "Sorting Algorithms", weightage: 20, difficulty: "EASY" },
        { name: "Linked Lists", weightage: 25, difficulty: "MEDIUM" },
        { name: "Dynamic Programming", weightage: 20, difficulty: "HARD" }
      ];
    }
    
    if (name.includes("database") || name.includes("dbms")) {
      return [
        { name: "Normal Forms & Relational Logic", weightage: 40, difficulty: "HARD" },
        { name: "SQL Queries", weightage: 25, difficulty: "EASY" },
        { name: "Transaction & Concurrency", weightage: 20, difficulty: "MEDIUM" },
        { name: "NoSQL Architectures", weightage: 15, difficulty: "MEDIUM" }
      ];
    }

    if (name.includes("math") || name.includes("calculus") || name.includes("algebra")) {
      return [
        { name: "Differential Equations", weightage: 35, difficulty: "HARD" },
        { name: "Linear Algebra & Matrices", weightage: 30, difficulty: "MEDIUM" },
        { name: "Probability Models", weightage: 20, difficulty: "MEDIUM" },
        { name: "Vector Calculus", weightage: 15, difficulty: "HARD" }
      ];
    }

    if (name.includes("operat") && name.includes("system")) {
      return [
        { name: "Process Scheduling & Deadlocks", weightage: 40, difficulty: "HARD" },
        { name: "Memory Management", weightage: 25, difficulty: "MEDIUM" },
        { name: "File Systems", weightage: 20, difficulty: "EASY" },
        { name: "I/O Systems", weightage: 15, difficulty: "MEDIUM" }
      ];
    }

    // Generic fallback for any other subject
    return [
      { name: "Unit 3 & 4 (Core Concepts)", weightage: 45, difficulty: "HARD" },
      { name: "Unit 1 (Introduction)", weightage: 20, difficulty: "EASY" },
      { name: "Unit 2 (Methodologies)", weightage: 20, difficulty: "MEDIUM" },
      { name: "Unit 5 (Advanced Applications)", weightage: 15, difficulty: "HARD" }
    ];
  }
}
