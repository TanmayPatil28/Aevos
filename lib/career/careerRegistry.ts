import { CareerPathDetails } from "./types";

export const CAREER_PATHS: Record<string, CareerPathDetails> = {
  SDE: {
    role: "SDE",
    title: "Software Development Engineer",
    description: "Focuses on design, development, and deployment of robust web and software systems. Highly valued in FAANG and standard product companies.",
    cgpaTargetRecommendation: 8.0,
    suggestedElectives: ["Object Oriented Software Engineering", "Cloud Computing", "Advanced Database Systems"],
    coreSkills: [
      { name: "Data Structures & Algorithms", category: "Core CS", status: "NOT_STARTED", importance: "CRITICAL", description: "LeetCode fundamentals, search/sort algorithms, complex tree/graph modeling." },
      { name: "Database Management Systems", category: "Core CS", status: "NOT_STARTED", importance: "CRITICAL", description: "Relational database schema modeling, SQL query tuning, indexing protocols." },
      { name: "System Design", category: "Core CS", status: "NOT_STARTED", importance: "RECOMMENDED", description: "Scalability structures, load balancing, caching, microservices architecture." },
      { name: "TypeScript / JavaScript", category: "Languages", status: "NOT_STARTED", importance: "CRITICAL", description: "Async operations, type boundaries, modern ES6+ structures." },
      { name: "React & Next.js", category: "Frameworks", status: "NOT_STARTED", importance: "RECOMMENDED", description: "SSR rendering optimization, state containment, client component patterns." },
      { name: "Docker & Containerization", category: "Tools & Platforms", status: "NOT_STARTED", importance: "OPTIONAL", description: "Multi-stage Dockerfiles, virtual deployment environments, container networks." }
    ]
  },
  DATA_SCIENTIST: {
    role: "DATA_SCIENTIST",
    title: "Data Scientist / ML Engineer",
    description: "Builds statistical models, machine learning algorithms, and pipelines to parse and interpret complex structured/unstructured datasets.",
    cgpaTargetRecommendation: 8.5,
    suggestedElectives: ["Big Data Analytics", "Natural Language Processing", "Deep Learning Architectures"],
    coreSkills: [
      { name: "Probability & Applied Statistics", category: "Core CS", status: "NOT_STARTED", importance: "CRITICAL", description: "Hypothesis testing, distributions, regression diagnostics, probability theory." },
      { name: "Machine Learning Foundations", category: "Core CS", status: "NOT_STARTED", importance: "CRITICAL", description: "Supervised and unsupervised models, model evaluation parameters, feature engineering." },
      { name: "Python Programming", category: "Languages", status: "NOT_STARTED", importance: "CRITICAL", description: "Core data science environments, NumPy, Pandas operations." },
      { name: "PyTorch / TensorFlow", category: "Frameworks", status: "NOT_STARTED", importance: "RECOMMENDED", description: "Neural network layer configurations, optimization gradients, model training iterations." },
      { name: "SQL & Data Warehousing", category: "Languages", status: "NOT_STARTED", importance: "RECOMMENDED", description: "Complex aggregates, analytics query functions, data warehousing schemas." },
      { name: "Jupyter & BI Tools", category: "Tools & Platforms", status: "NOT_STARTED", importance: "OPTIONAL", description: "Interactive data visualization pipelines, dashboard reporting models." }
    ]
  },
  DEVOPS: {
    role: "DEVOPS",
    title: "DevOps & Site Reliability Engineer",
    description: "Orchestrates deployment pipelines, infrastructure automation, server monitoring, and continuous integration workflows.",
    cgpaTargetRecommendation: 7.5,
    suggestedElectives: ["Computer Networks & Security", "Distributed Systems", "Unix/Linux System Administration"],
    coreSkills: [
      { name: "Operating Systems & Linux", category: "Core CS", status: "NOT_STARTED", importance: "CRITICAL", description: "Process models, system calls, memory partitions, advanced Bash scripting." },
      { name: "Computer Networks & Protocols", category: "Core CS", status: "NOT_STARTED", importance: "CRITICAL", description: "TCP/IP layers, routing controls, DNS architectures, SSL/TLS handshake security." },
      { name: "Kubernetes & Orchestration", category: "Frameworks", status: "NOT_STARTED", importance: "CRITICAL", description: "YAML setups, ingress controls, service meshes, replica controllers." },
      { name: "Terraform & IaC", category: "Frameworks", status: "NOT_STARTED", importance: "RECOMMENDED", description: "Declarative infrastructure maps, provider structures, remote state models." },
      { name: "CI/CD & GitHub Actions", category: "Tools & Platforms", status: "NOT_STARTED", importance: "CRITICAL", description: "Workflow configurations, build stages, artifact management, runner setups." },
      { name: "AWS / GCP Cloud Services", category: "Tools & Platforms", status: "NOT_STARTED", importance: "RECOMMENDED", description: "VPC partitions, server instances, container registries, permissions management." }
    ]
  }
};
