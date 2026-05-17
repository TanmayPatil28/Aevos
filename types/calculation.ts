export interface Subject {
  name: string;
  credits: number;
  score: number;
}

export interface Calculation {
  id: number;
  date: string;
  semester: string;
  subjects: Subject[];
  sgpa: number;
  cgpa: number;
  total_credits: number;
  created_at?: string;
}
