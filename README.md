<div align="center">
  <h1>🌟 GradeFlow</h1>
  <p>The Ultimate Academic Companion</p>

  <p>
    <a href="https://github.com/TanmayPatil28/GradeFlow/issues"><img alt="Issues" src="https://img.shields.io/github/issues/TanmayPatil28/GradeFlow?color=0088ff&style=for-the-badge&logo=github"/></a>
    <a href="https://github.com/TanmayPatil28/GradeFlow/pulls"><img alt="Pull Requests" src="https://img.shields.io/github/issues-pr/TanmayPatil28/GradeFlow?color=0088ff&style=for-the-badge&logo=github"/></a>
    <a href="https://github.com/TanmayPatil28/GradeFlow/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/TanmayPatil28/GradeFlow?color=0088ff&style=for-the-badge&logo=github"/></a>
  </p>
</div>

<br />

GradeFlow is a powerful, beautifully designed SaaS application built to help university students take control of their academics. Featuring a premium **"Levitating Liquid Glass"** UI, it allows you to calculate current SGPA/CGPA, forecast future semesters to achieve a target CGPA, and track your historical academic progression.

## ✨ Key Features

- 🎯 **Advanced CGPA Prediction:** Intelligently maps out exactly what grades you need in upcoming semesters to hit your dream target.
- 📊 **Dynamic Dashboards:** Beautiful, interactive visual charts charting your multi-semester trends.
- 🔮 **Premium Aesthetics:** Fully responsive, modern "glassmorphism" design with fluid animations and a sleek dark mode.
- ⚡ **Interactive Calculators:** Instant SGPA/CGPA feedback taking into account custom grading scales.
- 🛡️ **Type-Safe Ecosystem:** Built securely with Next.js, Prisma, and fully typed TypeScript.

## 🛠️ Tech Stack

**Client:** React, Next.js, Tailwind CSS  
**Server:** Next.js API Routes, Node.js  
**Database:** Prisma ORM  

## 🚀 Getting Started

Follow these steps to run the project locally.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TanmayPatil28/GradeFlow.git
   cd GradeFlow/gradeflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root and add your database configuration:
   ```env
   DATABASE_URL="your_database_url_here"
   ```

4. **Initialize Prisma (Optional depending on DB setup)**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is open-source.
