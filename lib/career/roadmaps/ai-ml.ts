import type { Edge, Node } from "@xyflow/react";

export interface RoadmapMilestone {
  id: string;
  text: string;
}

export interface RoadmapResource {
  id: string;
  title: string;
  url: string;
  type: "article" | "video" | "project" | "course";
  isBest?: boolean;
}

export interface RoadmapNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  category: "golden" | "alternative" | "bonus";
  difficulty?: "Beginner" | "Medium" | "Advanced";
  estHours?: number;
  milestones: RoadmapMilestone[];
  resources: RoadmapResource[];
}

// Custom Node type alias for React Flow
export type CareerNode = Node<RoadmapNodeData>;

export const aiMlNodes: CareerNode[] = [
  {
    id: "python-basics",
    type: "golden",
    position: { x: 250, y: 50 },
    data: {
      label: "Python Basics",
      description: "Learn the core fundamentals of Python, the primary language for AI/ML.",
      category: "golden",
      difficulty: "Beginner",
      estHours: 15,
      milestones: [
        { id: "m-py-1", text: "Understand Variables, Loops, and Functions" },
        { id: "m-py-2", text: "Master Lists, Dictionaries, and Sets" },
        { id: "m-py-3", text: "Build a simple CLI calculator" },
      ],
      resources: [
        { id: "r-py-1", title: "Corey Schafer: Python Tutorials", url: "https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7", type: "video", isBest: true },
        { id: "r-py-2", title: "Official Python Documentation", url: "https://docs.python.org/3/tutorial/index.html", type: "article" }
      ]
    }
  },
  {
    id: "numpy",
    type: "golden",
    position: { x: 250, y: 150 },
    data: {
      label: "NumPy & Math",
      description: "Learn numerical computing with NumPy.",
      category: "golden",
      difficulty: "Medium",
      estHours: 10,
      milestones: [
        { id: "m-np-1", text: "Understand N-dimensional arrays" },
        { id: "m-np-2", text: "Perform matrix operations" },
      ],
      resources: [
        { id: "r-np-1", title: "NumPy Quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html", type: "article", isBest: true }
      ]
    }
  },
  {
    id: "pandas",
    type: "golden",
    position: { x: 100, y: 250 },
    data: {
      label: "Pandas",
      description: "Data manipulation and analysis.",
      category: "golden",
      difficulty: "Medium",
      estHours: 12,
      milestones: [
        { id: "m-pd-1", text: "Master DataFrames and Series" },
        { id: "m-pd-2", text: "Perform data cleaning on a real dataset" },
      ],
      resources: [
        { id: "r-pd-1", title: "Pandas 10 minutes", url: "https://pandas.pydata.org/docs/user_guide/10min.html", type: "article" }
      ]
    }
  },
  {
    id: "r-lang",
    type: "alternative",
    position: { x: 400, y: 150 },
    data: {
      label: "R Language",
      description: "Alternative to Python for statistical computing.",
      category: "alternative",
      difficulty: "Beginner",
      estHours: 20,
      milestones: [
        { id: "m-r-1", text: "Learn R Syntax" },
      ],
      resources: []
    }
  },
  {
    id: "ml-basics",
    type: "golden",
    position: { x: 250, y: 350 },
    data: {
      label: "Machine Learning Basics",
      description: "Scikit-Learn, Regression, and Classification.",
      category: "golden",
      difficulty: "Advanced",
      estHours: 30,
      milestones: [
        { id: "m-ml-1", text: "Implement Linear & Logistic Regression" },
        { id: "m-ml-2", text: "Understand Overfitting & Cross-Validation" },
      ],
      resources: [
        { id: "r-ml-1", title: "Andrew Ng Machine Learning", url: "https://www.coursera.org/specializations/machine-learning-introduction", type: "course", isBest: true }
      ]
    }
  },
  {
    id: "deep-learning",
    type: "bonus",
    position: { x: 250, y: 450 },
    data: {
      label: "Deep Learning Intro",
      description: "Introduction to Neural Networks with PyTorch.",
      category: "bonus",
      difficulty: "Advanced",
      estHours: 25,
      milestones: [
        { id: "m-dl-1", text: "Build a basic Neural Network" },
      ],
      resources: []
    }
  }
];

export const aiMlEdges: Edge[] = [
  { id: "e-py-np", source: "python-basics", target: "numpy", animated: true },
  { id: "e-py-r", source: "python-basics", target: "r-lang", animated: false, style: { strokeDasharray: '5 5' } },
  { id: "e-np-pd", source: "numpy", target: "pandas", animated: true },
  { id: "e-pd-ml", source: "pandas", target: "ml-basics", animated: true },
  { id: "e-ml-dl", source: "ml-basics", target: "deep-learning", animated: false },
];

export const aiMlRoadmap = {
  id: "ai-ml",
  title: "AI/ML Engineer",
  description: "Learn to build intelligent systems, from basic Python to advanced Neural Networks.",
  nodes: aiMlNodes,
  edges: aiMlEdges
};
