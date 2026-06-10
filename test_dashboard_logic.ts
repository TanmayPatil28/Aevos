const store = {
  semesterHistory: Array.from({ length: 13 }, (_, i) => ({ semester: i + 1 }))
};

if (store.semesterHistory.length > 12 || store.semesterHistory.some(s => s.semester > 15)) {
  console.log("BUG: Local storage would be wiped!");
} else {
  console.log("SAFE: Data intact.");
}

