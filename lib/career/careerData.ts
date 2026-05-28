import { CompanyCriteria } from "./intelligenceEngine";

export const ROLE_SKILL_MAP: Record<string, { [key: string]: string[] }> = {
  "Frontend Developer": {
    "level_1_basics": ["HTML5", "CSS3", "JavaScript (ES6+)", "DOM Manipulation"],
    "level_2_core": ["React.js", "Angular", "Vue.js", "State Management", "Routing"],
    "level_3_intermediate": ["Redux", "Zustand", "Webpack", "Vite", "Server-Side Rendering (SSR)"],
    "level_4_advanced": ["Next.js", "Micro-frontends", "WebAssembly", "CI/CD Pipelines", "Web Vitals Optimization"]
  },
  "Backend Developer": {
    "level_1_basics": ["Python", "Java", "Node.js", "SQL", "Relational Databases"],
    "level_2_core": ["Express.js", "Django", "Spring Boot", "RESTful APIs", "JWT Authentication"],
    "level_3_intermediate": ["GraphQL", "Redis Caching", "Docker Containerization", "ORM"],
    "level_4_advanced": ["Microservices", "Apache Kafka", "RabbitMQ", "Distributed Systems", "High Availability Architecture"]
  },
  "Full Stack Developer": {
    "level_1_basics": ["HTML/CSS/JS", "Basic Server Scripts", "Database Integration"],
    "level_2_core": ["MERN Stack", "MEAN Stack", "CRUD Applications", "API Integration"],
    "level_3_intermediate": ["CI/CD Pipelines", "AWS EC2/Heroku", "WebSocket", "Real-time Streaming"],
    "level_4_advanced": ["Global Scalability", "End-to-End Security", "Database Indexing", "Query Optimization"]
  },
  "Data Scientist": {
    "level_1_basics": ["Python", "R", "Descriptive Statistics", "SQL", "Data Wrangling"],
    "level_2_core": ["Pandas", "NumPy", "Scikit-Learn", "Exploratory Data Analysis (EDA)"],
    "level_3_intermediate": ["Machine Learning Algorithms", "NLP", "Tableau", "PowerBI"],
    "level_4_advanced": ["Deep Neural Networks", "Hadoop", "Apache Spark", "MLOps", "Model Drift Detection"]
  },
  "DevOps Engineer": {
    "level_1_basics": ["Linux CLI", "Bash Scripting", "Git Branching Strategies"],
    "level_2_core": ["Jenkins", "GitHub Actions", "Ansible", "Docker Lifecycle"],
    "level_3_intermediate": ["Kubernetes (K8s)", "Terraform", "AWS/GCP/Azure Infrastructure"],
    "level_4_advanced": ["Chaos Engineering", "Service Mesh (Istio)", "Site Reliability Engineering (SRE)", "SLOs"]
  },
  "Cloud Architect": {
    "level_1_basics": ["TCP/IP", "DNS Routing", "OS Kernels", "IaaS/PaaS/SaaS Concepts"],
    "level_2_core": ["AWS EC2/S3", "Azure VMs", "Identity and Access Management (IAM)"],
    "level_3_intermediate": ["Serverless (AWS Lambda)", "Zero-Trust Security", "Declarative Networking"],
    "level_4_advanced": ["Multi-cloud Migration", "Hybrid-cloud", "Resource Lifecycle Management", "Disaster Recovery"]
  },
  "AI/ML Engineer": {
    "level_1_basics": ["Python", "Linear Algebra", "Calculus", "Data Structures"],
    "level_2_core": ["Feature Engineering", "ML Classifiers", "Model Evaluation Metrics (F1-score)"],
    "level_3_intermediate": ["Deep Neural Networks (CNNs, RNNs)", "TensorFlow", "PyTorch", "Hardware Acceleration"],
    "level_4_advanced": ["LLM Fine-Tuning", "Generative AI Pipelines", "CUDA", "TensorRT", "Edge Inference"]
  },
  "Cybersecurity Analyst": {
    "level_1_basics": ["OSI Model", "Linux Admin", "Public-Key Cryptography"],
    "level_2_core": ["Vulnerability Assessments", "OWASP Top 10", "Penetration Testing"],
    "level_3_intermediate": ["SIEM Systems", "Digital Forensics", "Incident Response"],
    "level_4_advanced": ["Zero Trust Architectures", "Red-Team Operations", "Continuous Threat Hunting"]
  },
  "Blockchain Developer": {
    "level_1_basics": ["Distributed Ledgers", "Cryptographic Hashing", "Game Theory"],
    "level_2_core": ["Smart Contracts", "Solidity", "Ethereum Testnets"],
    "level_3_intermediate": ["Web3.js", "Ethers.js", "Decentralized Applications (DApps)", "Consensus Algorithms"],
    "level_4_advanced": ["Layer 2 Scaling (ZK-Rollups)", "DeFi Protocols", "Zero-Knowledge (ZK) Proofs"]
  },
  "Mobile/Android Developer": {
    "level_1_basics": ["Java", "Kotlin", "Android Studio", "XML UI Rendering"],
    "level_2_core": ["Activity/Fragment Lifecycles", "REST API Integration", "SQLite/Room Database"],
    "level_3_intermediate": ["Flutter", "React Native", "MVVM Architecture"],
    "level_4_advanced": ["Memory Optimization", "Hardware-accelerated UI", "NDK (C++)", "High-performance Computing"]
  }
};

export const DEFAULT_RECRUITERS: CompanyCriteria[] = [
  // TIER 1: IT SERVICE INTEGRATORS
  { name: "TCS Ninja", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 100, tier: "Service", requiredSkills: ["Aptitude", "Basic Java/C", "SQL", "Communication"] },
  { name: "TCS Digital", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Service", requiredSkills: ["DSA", "Java", "Python", "Full Stack"] },
  { name: "Infosys", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 100, tier: "Service", requiredSkills: ["Aptitude", "Core CS", "DBMS"] },
  { name: "Infosys Specialist Programmer", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Service", requiredSkills: ["DSA", "System Design", "DBMS"] },
  { name: "Wipro Standard", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 100, tier: "Service", requiredSkills: ["Logical Reasoning", "Coding", "Java"] },
  { name: "Wipro Turbo", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 110, tier: "Service", requiredSkills: ["DSA", "System Design", "Cloud"] },
  { name: "Cognizant GenC", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 100, tier: "Service", requiredSkills: ["Automata Fix", "Aptitude", "Java"] },
  { name: "Cognizant GenC Next", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 110, tier: "Service", requiredSkills: ["DSA", "Full Stack", "React", "Node.js"] },
  { name: "Accenture ASE", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 100, tier: "Service", requiredSkills: ["Cognitive", "Tech Assessment", "Java"] },
  { name: "Accenture SE", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 110, tier: "Service", requiredSkills: ["DSA", "Cloud", "System Architecture"] },
  { name: "Capgemini", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 100, tier: "Service", requiredSkills: ["Aptitude", "Pseudo Code", "Java"] },
  { name: "Tech Mahindra", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 100, tier: "Service", requiredSkills: ["Aptitude", "SQL", "Java"] },
  { name: "Hexaware", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 100, tier: "Service", requiredSkills: ["Aptitude", "OOPs", "DBMS"] },
  
  // TIER 2: PRODUCT DEVELOPMENT COMPANIES
  { name: "Goldman Sachs", cgpaCutoff: 6.0, maxBacklogs: 1, requiredCredits: 120, tier: "Product", requiredSkills: ["Mathematical Algorithms", "Java", "DSA"] },
  { name: "Morgan Stanley", cgpaCutoff: 8.0, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["Core CS", "Advanced OOPs", "System Design"] },
  { name: "NVIDIA", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["OS", "Hardware Arch", "C", "C++"] },
  { name: "Cisco", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["Networking", "C", "OS Concepts", "Linux"] },
  { name: "Qualcomm", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["Embedded Systems", "Wireless", "C", "C++"] },
  { name: "Adobe", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["DSA", "C++", "System Design", "OS"] },
  { name: "Samsung R&D", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["DSA", "C++", "Java", "Problem Solving"] },
  { name: "Oracle", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["DBMS", "SQL", "Java", "System Design"] },
  { name: "Intuit", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["DSA", "Java", "React", "System Architecture"] },
  { name: "Texas Instruments", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Product", requiredSkills: ["Analog", "Digital Circuits", "C", "Embedded"] },
  
  // TIER 3: FAANG & BIG TECH
  { name: "Google", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["DSA", "Graph Theory", "Algorithms", "System Design"] },
  { name: "Microsoft", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["DSA", "System Design", "C++", "C#"] },
  { name: "Amazon", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["DSA", "Leadership Principles", "Java", "System Design"] },
  { name: "Meta", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["Scalability", "DSA", "React", "System Design"] },
  { name: "Apple", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["DSA", "Swift", "C++", "OS Internals"] },
  { name: "Uber", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["DSA", "Backend Architecture", "Go", "Distributed Systems"] },
  { name: "Netflix", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["Distributed Systems", "Java", "React", "Cloud Architecture"] },
  { name: "LinkedIn", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "FAANG", requiredSkills: ["Java", "Scala", "System Design", "DSA"] },
  
  // TIER 4: UNICORNS & STARTUPS
  { name: "PhonePe", cgpaCutoff: 7.5, maxBacklogs: 0, requiredCredits: 120, tier: "Startup", requiredSkills: ["Advanced DSA", "System Design", "Java"] },
  { name: "Flipkart", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 100, tier: "Startup", requiredSkills: ["DSA", "Machine Coding", "System Design"] },
  { name: "Swiggy", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 100, tier: "Startup", requiredSkills: ["Practical System Design", "Java", "DSA"] },
  { name: "Zomato", cgpaCutoff: 6.5, maxBacklogs: 0, requiredCredits: 100, tier: "Startup", requiredSkills: ["React", "Node.js", "Execution Speed"] },
  { name: "Razorpay", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Startup", requiredSkills: ["Architecture", "Go", "PHP", "System Design"] },
  { name: "Cred", cgpaCutoff: 7.0, maxBacklogs: 0, requiredCredits: 120, tier: "Startup", requiredSkills: ["Java", "Spring Boot", "System Design", "DSA"] },
  { name: "OYO Rooms", cgpaCutoff: 6.0, maxBacklogs: 0, requiredCredits: 100, tier: "Startup", requiredSkills: ["Java", "DSA", "Problem Solving"] },
  { name: "BookMyShow", cgpaCutoff: 5.0, maxBacklogs: 0, requiredCredits: 100, tier: "Startup", requiredSkills: ["React", "Node.js", "Web Technologies"] }
];
