export interface SkillTrack {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  marketDemand: "High" | "Very High" | "Critical";
  iconName: string;
  salaryRange?: string;
  atsKeywords?: string[];
  placementProbability?: number;
}

const SKILL_TRACKS: SkillTrack[] = [
  {
    "id": "role-ai-ml-engineer",
    "title": "AI/ML Engineer",
    "description": "Critical for scaling agentic AI ambitions across product lines.",
    "category": "Roles",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "BrainCircuit",
    "salaryRange": "$150K - $180K",
    "atsKeywords": [
      "AI/ML",
      "Agile",
      "Agile"
    ],
    "placementProbability": 85
  },
  {
    "id": "role-cybersecurity-engineer",
    "title": "Cybersecurity Engineer",
    "description": "Protects cloud boundaries and mitigates vulnerabilities natively introduced by untested LLM code. Job postings for this role surged 124% year-over-year.",
    "category": "Roles",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "ShieldCheck",
    "salaryRange": "$153K - $187K",
    "atsKeywords": [
      "Cybersecurity",
      "Microservices",
      "Scalability"
    ],
    "placementProbability": 86
  },
  {
    "id": "role-software-architect",
    "title": "Software Architect",
    "description": "Responsible for designing high-level system structures that integrate complex microservices and event-driven data pipelines. Ensures systems can handle immense multi-tool toolchains.",
    "category": "Roles",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "Network",
    "salaryRange": "$156K - $194K",
    "atsKeywords": [
      "Software",
      "Optimization",
      "System Design"
    ],
    "placementProbability": 87
  },
  {
    "id": "role-full-stack-developer",
    "title": "Full-Stack Developer",
    "description": "Provides end-to-end feature ownership by bridging TypeScript frontends with performant microservices. Remains the most dominant engineering role globally.",
    "category": "Roles",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Layers",
    "salaryRange": "$109K - $151K",
    "atsKeywords": [
      "Full-Stack",
      "Architecture",
      "Architecture"
    ],
    "placementProbability": 78
  },
  {
    "id": "role-backend-developer",
    "title": "Back-End Developer",
    "description": "Specializes in concurrency, server-side processing, and API development. High demand relies heavily on mastery of compiled languages like Go and Rust.",
    "category": "Roles",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Server",
    "salaryRange": "$112K - $133K",
    "atsKeywords": [
      "Back-End",
      "GraphQL",
      "Microservices"
    ],
    "placementProbability": 79
  },
  {
    "id": "role-cloud-architect",
    "title": "Cloud Architect",
    "description": "Designs robust infrastructure utilizing multi-cloud setups and serverless architectures. Their strategies prevent vendor lock-in and optimize staggering cloud compute costs.",
    "category": "Roles",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "CloudCog",
    "salaryRange": "$150K - $190K",
    "atsKeywords": [
      "Cloud",
      "System Design",
      "REST APIs"
    ],
    "placementProbability": 90
  },
  {
    "id": "role-devops-engineer",
    "title": "DevOps Engineer",
    "description": "Maintains seamless CI/CD pipelines and infrastructure-as-code automation. Essential for deploying software updates hundreds of times a day safely.",
    "category": "Roles",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "GitBranch",
    "salaryRange": "$153K - $197K",
    "atsKeywords": [
      "DevOps",
      "CI/CD",
      "CI/CD"
    ],
    "placementProbability": 91
  },
  {
    "id": "role-data-scientist",
    "title": "Data Scientist",
    "description": "Extracts actionable intelligence from massive datasets to drive core enterprise strategy. Requires deep statistical reasoning beyond basic code execution.",
    "category": "Roles",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "ScatterChart",
    "salaryRange": "$156K - $204K",
    "atsKeywords": [
      "Data",
      "Scalability",
      "GraphQL"
    ],
    "placementProbability": 92
  },
  {
    "id": "role-product-manager",
    "title": "Product Manager",
    "description": "Aligns deep technical engineering output with overarching business value. Guides the strategic scaling of agentic AI features directly impacting users.",
    "category": "Roles",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Presentation",
    "salaryRange": "$109K - $136K",
    "atsKeywords": [
      "Product",
      "REST APIs",
      "Optimization"
    ],
    "placementProbability": 83
  },
  {
    "id": "role-site-reliability-engineer",
    "title": "Site Reliability Engineer",
    "description": "Guarantees system uptime and resolves complex production failures using deep observability tools. Essential for organizations scaling AI and handling high traffic.",
    "category": "Roles",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "Activity",
    "salaryRange": "$162K - $193K",
    "atsKeywords": [
      "Site",
      "Agile",
      "Agile"
    ],
    "placementProbability": 94
  },
  {
    "id": "front-typescript",
    "title": "TypeScript",
    "description": "The undisputed #1 language globally due to its strict type system. Massively reduces AI hallucination rates and is non-negotiable for enterprise frontends.",
    "category": "Frontend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Critical",
    "iconName": "FileCode",
    "salaryRange": "$100K - $150K",
    "atsKeywords": [
      "TypeScript",
      "Microservices",
      "Scalability"
    ],
    "placementProbability": 95
  },
  {
    "id": "front-nextjs",
    "title": "Next.js",
    "description": "The leading full-stack framework offering up to 400% faster dev startup and AI agent tooling. Ideal for SEO-driven, server-rendered applications.",
    "category": "Frontend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Critical",
    "iconName": "FastForward",
    "salaryRange": "$103K - $132K",
    "atsKeywords": [
      "Next.js",
      "Optimization",
      "System Design"
    ],
    "placementProbability": 96
  },
  {
    "id": "front-react",
    "title": "React.js",
    "description": "The industry standard library for building dynamic, component-based UIs. Now heavily augmented by features like React Compiler for performance.",
    "category": "Frontend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Very High",
    "iconName": "Atom",
    "salaryRange": "$106K - $139K",
    "atsKeywords": [
      "React.js",
      "Architecture",
      "Architecture"
    ],
    "placementProbability": 85
  },
  {
    "id": "front-tailwindcss",
    "title": "TailwindCSS",
    "description": "A utility-first CSS framework enforcing highly scalable design constraints. Eliminates massive technical debt associated with sprawling traditional stylesheets.",
    "category": "Frontend Technologies",
    "difficulty": "Beginner",
    "marketDemand": "High",
    "iconName": "Palette",
    "salaryRange": "$79K - $116K",
    "atsKeywords": [
      "TailwindCSS",
      "GraphQL",
      "Microservices"
    ],
    "placementProbability": 76
  },
  {
    "id": "front-threejs",
    "title": "Three.js",
    "description": "Provides powerful, browser-based 3D visualizations leveraging WebGL. Crucial for companies building immersive computing experiences and digital twins.",
    "category": "Frontend Technologies",
    "difficulty": "Advanced",
    "marketDemand": "High",
    "iconName": "Box",
    "salaryRange": "$162K - $203K",
    "atsKeywords": [
      "Three.js",
      "System Design",
      "REST APIs"
    ],
    "placementProbability": 77
  },
  {
    "id": "front-vuejs",
    "title": "Vue.js",
    "description": "Favored by startups and SMBs for its simplicity and fast learning curve. Excellent for rapidly building performant, single-page web applications.",
    "category": "Frontend Technologies",
    "difficulty": "Beginner",
    "marketDemand": "High",
    "iconName": "MonitorPlay",
    "salaryRange": "$70K - $105K",
    "atsKeywords": [
      "Vue.js",
      "CI/CD",
      "CI/CD"
    ],
    "placementProbability": 78
  },
  {
    "id": "front-astro",
    "title": "Astro",
    "description": "An emerging framework prioritizing minimal JavaScript delivery and server-side rendering. The best choice for ultra-high performance content sites.",
    "category": "Frontend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Rocket",
    "salaryRange": "$103K - $142K",
    "atsKeywords": [
      "Astro",
      "Scalability",
      "GraphQL"
    ],
    "placementProbability": 79
  },
  {
    "id": "front-websockets",
    "title": "WebSockets",
    "description": "Enables real-time, two-way communication between the browser and the server. Essential for real-time dashboards, chat apps, and live AI responses.",
    "category": "Frontend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Very High",
    "iconName": "Plug",
    "salaryRange": "$106K - $149K",
    "atsKeywords": [
      "WebSockets",
      "REST APIs",
      "Optimization"
    ],
    "placementProbability": 90
  },
  {
    "id": "front-sveltekit",
    "title": "SvelteKit",
    "description": "A framework that provides compile-time optimized applications without virtual DOM overhead. Highly demanded for extremely fluid user experiences.",
    "category": "Frontend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Zap",
    "salaryRange": "$109K - $131K",
    "atsKeywords": [
      "SvelteKit",
      "Agile",
      "Agile"
    ],
    "placementProbability": 81
  },
  {
    "id": "front-htmx",
    "title": "HTMX",
    "description": "Allows developers to access modern browser features directly from HTML. Highly demanded by backend engineers wanting minimal JavaScript for server-driven UI.",
    "category": "Frontend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Code",
    "salaryRange": "$112K - $138K",
    "atsKeywords": [
      "HTMX",
      "Microservices",
      "Scalability"
    ],
    "placementProbability": 82
  },
  {
    "id": "back-go",
    "title": "Go (Golang)",
    "description": "The fastest-growing backend language, prized for native concurrency via goroutines. It is the absolute standard for building high-performance microservices.",
    "category": "Backend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Critical",
    "iconName": "Cpu",
    "salaryRange": "$100K - $145K",
    "atsKeywords": [
      "Go",
      "Optimization",
      "System Design"
    ],
    "placementProbability": 93
  },
  {
    "id": "back-rust",
    "title": "Rust",
    "description": "Beloved for eliminating memory vulnerabilities at compile time. Increasingly utilized to rewrite core tooling and performance-critical AI systems.",
    "category": "Backend Technologies",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "Shield",
    "salaryRange": "$153K - $202K",
    "atsKeywords": [
      "Rust",
      "Architecture",
      "Architecture"
    ],
    "placementProbability": 94
  },
  {
    "id": "back-nodejs",
    "title": "Node.js",
    "description": "Efficient, event-driven runtime ideal for real-time data streaming. Keeps frontend and backend development unified under the JavaScript/TypeScript ecosystem.",
    "category": "Backend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Very High",
    "iconName": "ServerCrash",
    "salaryRange": "$106K - $134K",
    "atsKeywords": [
      "Node.js",
      "GraphQL",
      "Microservices"
    ],
    "placementProbability": 95
  },
  {
    "id": "back-python",
    "title": "Python",
    "description": "The undisputed lingua franca of AI with over 2.6M contributors in the data space. Necessary for any backend bridging machine learning models.",
    "category": "Backend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Critical",
    "iconName": "Terminal",
    "salaryRange": "$109K - $141K",
    "atsKeywords": [
      "Python",
      "System Design",
      "REST APIs"
    ],
    "placementProbability": 96
  },
  {
    "id": "back-postgresql",
    "title": "PostgreSQL",
    "description": "The gold-standard open-source relational database. With pgvector, it has become crucial for hybrid data storage including AI vector embeddings.",
    "category": "Backend Technologies",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "Database",
    "salaryRange": "$162K - $198K",
    "atsKeywords": [
      "PostgreSQL",
      "CI/CD",
      "CI/CD"
    ],
    "placementProbability": 85
  },
  {
    "id": "back-cpp",
    "title": "C++",
    "description": "Maintains a top-5 language spot globally due to its hardware-proximate speed. Heavily utilized in foundational AI inference engines and low-latency trading.",
    "category": "Backend Technologies",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "Cpu",
    "salaryRange": "$150K - $180K",
    "atsKeywords": [
      "C++",
      "Scalability",
      "GraphQL"
    ],
    "placementProbability": 86
  },
  {
    "id": "back-javaspring",
    "title": "Java/Spring Boot",
    "description": "A stalwart for enterprise-grade, performance-driven solutions. Highly valued by banking and legacy tech giants for massive scalability.",
    "category": "Backend Technologies",
    "difficulty": "Advanced",
    "marketDemand": "High",
    "iconName": "Coffee",
    "salaryRange": "$153K - $187K",
    "atsKeywords": [
      "Java/Spring",
      "REST APIs",
      "Optimization"
    ],
    "placementProbability": 77
  },
  {
    "id": "back-graphql",
    "title": "GraphQL",
    "description": "Optimizes data fetching by allowing clients to request exactly what they need. Prevents over-fetching in complex applications with highly relational data.",
    "category": "Backend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "GitMerge",
    "salaryRange": "$106K - $144K",
    "atsKeywords": [
      "GraphQL",
      "Agile",
      "Agile"
    ],
    "placementProbability": 78
  },
  {
    "id": "back-mongodb",
    "title": "MongoDB",
    "description": "A leading NoSQL database ideal for unstructured data and dynamic schemas. Powers real-time analytics and massive content management systems.",
    "category": "Backend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "DatabaseZap",
    "salaryRange": "$109K - $151K",
    "atsKeywords": [
      "MongoDB",
      "Microservices",
      "Scalability"
    ],
    "placementProbability": 79
  },
  {
    "id": "back-redis",
    "title": "Redis",
    "description": "An in-memory data structure store used primarily as a blazing-fast cache. Essential for minimizing database load in applications serving millions of users.",
    "category": "Backend Technologies",
    "difficulty": "Intermediate",
    "marketDemand": "Very High",
    "iconName": "MemoryStick",
    "salaryRange": "$112K - $133K",
    "atsKeywords": [
      "Redis",
      "Optimization",
      "System Design"
    ],
    "placementProbability": 90
  },
  {
    "id": "data-agentic-ai",
    "title": "Agentic AI",
    "description": "Autonomous workflows capable of multi-step reasoning and self-correction. 96% of technologists see this as the fastest accelerating enterprise trend in 2026.",
    "category": "Data & AI",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "Bot",
    "salaryRange": "$150K - $190K",
    "atsKeywords": [
      "Agentic",
      "Architecture",
      "Architecture"
    ],
    "placementProbability": 91
  },
  {
    "id": "data-mcp",
    "title": "Model Context Protocol (MCP)",
    "description": "An open standard that connects AI models securely to external data sources. Rapidly becoming a mandatory infrastructure skill to prevent AI shadow IT.",
    "category": "Data & AI",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "Waypoints",
    "salaryRange": "$153K - $197K",
    "atsKeywords": [
      "Model",
      "GraphQL",
      "Microservices"
    ],
    "placementProbability": 92
  },
  {
    "id": "data-rag",
    "title": "RAG Architectures",
    "description": "Retrieval-Augmented Generation grounds LLM responses in proprietary enterprise data. Crucial for building accurate internal chatbots that bypass model hallucination.",
    "category": "Data & AI",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "DatabaseSearch",
    "salaryRange": "$156K - $204K",
    "atsKeywords": [
      "RAG",
      "System Design",
      "REST APIs"
    ],
    "placementProbability": 93
  },
  {
    "id": "data-pytorch",
    "title": "PyTorch",
    "description": "The leading deep learning framework for training neural networks. Provides immense flexibility for ML engineers developing custom foundational models.",
    "category": "Data & AI",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "Flame",
    "salaryRange": "$159K - $186K",
    "atsKeywords": [
      "PyTorch",
      "CI/CD",
      "CI/CD"
    ],
    "placementProbability": 94
  },
  {
    "id": "data-tensorflow",
    "title": "TensorFlow",
    "description": "Google's powerful ecosystem for machine learning. Highly demanded for deploying robust, production-ready AI models at massive global scale.",
    "category": "Data & AI",
    "difficulty": "Advanced",
    "marketDemand": "High",
    "iconName": "Cpu",
    "salaryRange": "$162K - $193K",
    "atsKeywords": [
      "TensorFlow",
      "Scalability",
      "GraphQL"
    ],
    "placementProbability": 85
  },
  {
    "id": "data-pandas",
    "title": "Pandas",
    "description": "The foundational Python library for data manipulation and analysis. Vital for cleaning the massive, structured datasets required to fine-tune AI.",
    "category": "Data & AI",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Table",
    "salaryRange": "$100K - $150K",
    "atsKeywords": [
      "Pandas",
      "REST APIs",
      "Optimization"
    ],
    "placementProbability": 86
  },
  {
    "id": "data-kafka",
    "title": "Apache Kafka",
    "description": "The central nervous system for real-time, event-driven microservices. Feeds live telemetry and high-throughput streaming directly into AI analytics engines.",
    "category": "Data & AI",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "ArrowRightLeft",
    "salaryRange": "$153K - $182K",
    "atsKeywords": [
      "Apache",
      "Agile",
      "Agile"
    ],
    "placementProbability": 85
  },
  {
    "id": "data-prompt-eng",
    "title": "LLM Prompt Engineering",
    "description": "The specialized skill of structuring text to optimize AI outputs. Vital for integrating LLMs programmatically without incurring excessive token costs.",
    "category": "Data & AI",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "MessageSquare",
    "salaryRange": "$106K - $139K",
    "atsKeywords": [
      "LLM",
      "Microservices",
      "Scalability"
    ],
    "placementProbability": 76
  },
  {
    "id": "data-vector-db",
    "title": "Vector Databases (pgvector)",
    "description": "Stores data as high-dimensional vectors, enabling semantic search. The absolute backbone of modern RAG architectures and AI memory recall.",
    "category": "Data & AI",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "DatabaseBackup",
    "salaryRange": "$159K - $196K",
    "atsKeywords": [
      "Vector",
      "Optimization",
      "System Design"
    ],
    "placementProbability": 87
  },
  {
    "id": "data-bigquery",
    "title": "Google BigQuery",
    "description": "A serverless data warehouse handling massive analytics processing. Empowers data scientists to execute SQL queries on petabytes of data rapidly.",
    "category": "Data & AI",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "CloudLightning",
    "salaryRange": "$112K - $153K",
    "atsKeywords": [
      "Google",
      "Architecture",
      "Architecture"
    ],
    "placementProbability": 78
  },
  {
    "id": "cloud-docker",
    "title": "Docker",
    "description": "A near-universal standard (71% adoption) for containerizing applications. Ensures code runs identically across any distributed cloud environment.",
    "category": "Cloud & DevOps",
    "difficulty": "Intermediate",
    "marketDemand": "Critical",
    "iconName": "Container",
    "salaryRange": "$100K - $135K",
    "atsKeywords": [
      "Docker",
      "GraphQL",
      "Microservices"
    ],
    "placementProbability": 89
  },
  {
    "id": "cloud-kubernetes",
    "title": "Kubernetes",
    "description": "The premier system for orchestrating, scaling, and managing containerized deployments. Essential for zero-downtime, self-healing microservices.",
    "category": "Cloud & DevOps",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "Network",
    "salaryRange": "$153K - $192K",
    "atsKeywords": [
      "Kubernetes",
      "System Design",
      "REST APIs"
    ],
    "placementProbability": 90
  },
  {
    "id": "cloud-aws",
    "title": "AWS (Amazon Web Services)",
    "description": "The dominant physical infrastructure backbone used by 43% of developers. Mastery of AWS primitives is a core prerequisite for elite backend engineering.",
    "category": "Cloud & DevOps",
    "difficulty": "Intermediate",
    "marketDemand": "Critical",
    "iconName": "Cloud",
    "salaryRange": "$106K - $149K",
    "atsKeywords": [
      "AWS",
      "CI/CD",
      "CI/CD"
    ],
    "placementProbability": 91
  },
  {
    "id": "cloud-terraform",
    "title": "Terraform (HCL)",
    "description": "Automates cloud provisioning using HashiCorp Configuration Language. HCL is currently the fastest-growing language on GitHub, reflecting massive IaC adoption.",
    "category": "Cloud & DevOps",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "Blocks",
    "salaryRange": "$159K - $181K",
    "atsKeywords": [
      "Terraform",
      "Scalability",
      "GraphQL"
    ],
    "placementProbability": 92
  },
  {
    "id": "cloud-github-actions",
    "title": "GitHub Actions",
    "description": "Native workflow automation directly within the world's most popular version control platform. Streamlines testing and deployment effortlessly.",
    "category": "Cloud & DevOps",
    "difficulty": "Intermediate",
    "marketDemand": "Very High",
    "iconName": "PlayCircle",
    "salaryRange": "$112K - $138K",
    "atsKeywords": [
      "GitHub",
      "REST APIs",
      "Optimization"
    ],
    "placementProbability": 93
  },
  {
    "id": "cloud-cicd",
    "title": "CI/CD Pipelines",
    "description": "Continuous Integration/Continuous Deployment ensures high-velocity feature shipping. Allows unicorns to update software safely hundreds of times daily.",
    "category": "Cloud & DevOps",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "GitPullRequest",
    "salaryRange": "$150K - $195K",
    "atsKeywords": [
      "CI/CD",
      "Agile",
      "Agile"
    ],
    "placementProbability": 94
  },
  {
    "id": "cloud-prometheus",
    "title": "Prometheus",
    "description": "The industry standard for event monitoring and alerting. Provides deep observability required to debug complex, AI-assisted operations in real-time.",
    "category": "Cloud & DevOps",
    "difficulty": "Advanced",
    "marketDemand": "High",
    "iconName": "LineChart",
    "salaryRange": "$153K - $202K",
    "atsKeywords": [
      "Prometheus",
      "Microservices",
      "Scalability"
    ],
    "placementProbability": 85
  },
  {
    "id": "cloud-argocd",
    "title": "ArgoCD",
    "description": "A declarative GitOps deployment tool for Kubernetes. Automates application syncs directly from git repositories, ensuring secure, trackable states.",
    "category": "Cloud & DevOps",
    "difficulty": "Advanced",
    "marketDemand": "High",
    "iconName": "RefreshCw",
    "salaryRange": "$156K - $184K",
    "atsKeywords": [
      "ArgoCD",
      "Optimization",
      "System Design"
    ],
    "placementProbability": 86
  },
  {
    "id": "cloud-azure",
    "title": "Microsoft Azure",
    "description": "A major enterprise cloud provider strongly backing AI integration via OpenAI partnerships. Deeply embedded in Fortune 500 infrastructure.",
    "category": "Cloud & DevOps",
    "difficulty": "Intermediate",
    "marketDemand": "Very High",
    "iconName": "CloudRain",
    "salaryRange": "$109K - $141K",
    "atsKeywords": [
      "Microsoft",
      "Architecture",
      "Architecture"
    ],
    "placementProbability": 85
  },
  {
    "id": "cloud-serverless",
    "title": "Serverless Architecture",
    "description": "Execution models like AWS Lambda where the cloud provider manages dynamic allocation. Eliminates server management and vastly optimizes costs.",
    "category": "Cloud & DevOps",
    "difficulty": "Intermediate",
    "marketDemand": "Very High",
    "iconName": "Zap",
    "salaryRange": "$112K - $148K",
    "atsKeywords": [
      "Serverless",
      "GraphQL",
      "Microservices"
    ],
    "placementProbability": 86
  },
  {
    "id": "cs-system-design",
    "title": "System Design",
    "description": "The architectural foresight to scale systems handling millions of concurrent actions. LLMs cannot yet replace this deep, high-level human logic.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "Network",
    "salaryRange": "$150K - $180K",
    "atsKeywords": [
      "System",
      "System Design",
      "REST APIs"
    ],
    "placementProbability": 87
  },
  {
    "id": "cs-dsa",
    "title": "Data Structures & Algorithms",
    "description": "The mathematical foundation of efficient software. Essential for passing top-tier interviews and evaluating Big-O space complexity in huge data pipelines.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "Binary",
    "salaryRange": "$153K - $187K",
    "atsKeywords": [
      "Data",
      "CI/CD",
      "CI/CD"
    ],
    "placementProbability": 88
  },
  {
    "id": "cs-cloud-security",
    "title": "Cloud Security",
    "description": "Secures boundaries across AWS, Azure, and GCP. Absolutely paramount as cloud endpoints become primary targets for sophisticated cyber attacks.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "CloudOff",
    "salaryRange": "$156K - $194K",
    "atsKeywords": [
      "Cloud",
      "Scalability",
      "GraphQL"
    ],
    "placementProbability": 89
  },
  {
    "id": "cs-penetration-testing",
    "title": "Penetration Testing",
    "description": "Proactively hacking internal corporate systems to discover lethal vulnerabilities before malicious actors do. A massive priority for defensive engineering.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "Target",
    "salaryRange": "$159K - $201K",
    "atsKeywords": [
      "Penetration",
      "REST APIs",
      "Optimization"
    ],
    "placementProbability": 90
  },
  {
    "id": "cs-incident-response",
    "title": "Incident Response",
    "description": "The high-pressure capability to mitigate system damage rapidly when a breach inevitably occurs. Prevents catastrophic loss of enterprise data.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "AlertOctagon",
    "salaryRange": "$162K - $183K",
    "atsKeywords": [
      "Incident",
      "Agile",
      "Agile"
    ],
    "placementProbability": 91
  },
  {
    "id": "cs-zero-trust",
    "title": "Zero-Trust Architecture",
    "description": "A strict security framework asserting that no user or system is trusted by default. Vital for treating internal AI infrastructure as a vulnerable vector.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "Very High",
    "iconName": "ShieldAlert",
    "salaryRange": "$150K - $190K",
    "atsKeywords": [
      "Zero-Trust",
      "Microservices",
      "Scalability"
    ],
    "placementProbability": 92
  },
  {
    "id": "cs-owasp",
    "title": "OWASP Vulnerabilities",
    "description": "Mastery of the top web security risks (like SQL injection and cross-site scripting). Ensures safe handling of user data globally.",
    "category": "Core CS & Security",
    "difficulty": "Intermediate",
    "marketDemand": "High",
    "iconName": "Bug",
    "salaryRange": "$103K - $147K",
    "atsKeywords": [
      "OWASP",
      "Optimization",
      "System Design"
    ],
    "placementProbability": 83
  },
  {
    "id": "cs-cryptography",
    "title": "Cryptography",
    "description": "The mathematical securing of data at rest and in transit. Protects APIs and microservice communications from malicious interception.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "High",
    "iconName": "Key",
    "salaryRange": "$156K - $204K",
    "atsKeywords": [
      "Cryptography",
      "Architecture",
      "Architecture"
    ],
    "placementProbability": 84
  },
  {
    "id": "cs-distributed-systems",
    "title": "Distributed Systems",
    "description": "Engineering multiple networked computers acting as a single entity. Prevents single points of failure in massive, globally accessed applications.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "Critical",
    "iconName": "Share2",
    "salaryRange": "$159K - $186K",
    "atsKeywords": [
      "Distributed",
      "GraphQL",
      "Microservices"
    ],
    "placementProbability": 95
  },
  {
    "id": "cs-blockchain",
    "title": "Blockchain Technology",
    "description": "Decentralized, immutable ledger systems. Utilized for high-integrity transactions, smart contracts, and secure supply chain data auditing.",
    "category": "Core CS & Security",
    "difficulty": "Advanced",
    "marketDemand": "High",
    "iconName": "Link",
    "salaryRange": "$162K - $193K",
    "atsKeywords": [
      "Blockchain",
      "System Design",
      "REST APIs"
    ],
    "placementProbability": 86
  }
];

export { SKILL_TRACKS };
