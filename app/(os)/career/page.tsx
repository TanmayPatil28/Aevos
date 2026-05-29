import Link from "next/link";
import { ArrowRight, BrainCircuit, Code2, Database, LayoutTemplate, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";

export default function CareerOSPage() {
  const tracks = [
    {
      id: "ai-ml",
      title: "AI/ML Engineer",
      description: "Master intelligent systems, from foundational Python to advanced deep learning and neural networks.",
      icon: <BrainCircuit className="w-8 h-8 text-indigo-400" />,
      active: true,
      color: "from-indigo-500/20 to-purple-500/20",
      border: "border-indigo-500/30 group-hover:border-indigo-400"
    },
    {
      id: "fullstack",
      title: "Full Stack Developer",
      description: "Build robust web applications from frontend UIs to backend architectures and databases.",
      icon: <LayoutTemplate className="w-8 h-8 text-sky-400" />,
      active: false,
      color: "from-sky-500/20 to-blue-500/20",
      border: "border-slate-800"
    },
    {
      id: "backend",
      title: "Backend Engineer",
      description: "Design scalable APIs, microservices, and high-performance database systems.",
      icon: <Database className="w-8 h-8 text-emerald-400" />,
      active: false,
      color: "from-emerald-500/20 to-teal-500/20",
      border: "border-slate-800"
    },
    {
      id: "dsa",
      title: "Placement DSA",
      description: "Master algorithms, data structures, and problem-solving for technical interviews.",
      icon: <Code2 className="w-8 h-8 text-rose-400" />,
      active: false,
      color: "from-rose-500/20 to-pink-500/20",
      border: "border-slate-800"
    },
    {
      id: "cyber",
      title: "Cybersecurity",
      description: "Learn ethical hacking, network security, and cryptography to protect systems.",
      icon: <ShieldCheck className="w-8 h-8 text-amber-400" />,
      active: false,
      color: "from-amber-500/20 to-orange-500/20",
      border: "border-slate-800"
    },
  ];

  return (
    <div className="w-full h-full flex flex-col pt-24 px-6 max-w-7xl mx-auto pb-32">
      <PageHero 
        headline={<>Structured skill paths.<br/>From beginner to industry-ready.</>}
        description="High-impact, structured roadmaps tailored to your career goals. Track your mastery of key technologies, uncover hidden prerequisites, and build an engineering portfolio that stands out."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          track.active ? (
            <Link href={`/career/${track.id}`} key={track.id} className="block group">
              <div className={`h-full rounded-[32px] border border-white/5 bg-[#1D1D1F] p-6 transition-all duration-300 hover:bg-[#28282B] hover:-translate-y-1 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${track.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
                    {track.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{track.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {track.description}
                  </p>
                  
                  <div className="flex items-center text-indigo-400 font-medium text-sm group-hover:text-indigo-300 transition-colors">
                    <span>View Roadmap</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div key={track.id} className={`h-full rounded-[32px] border border-white/5 bg-[#1D1D1F] p-6 relative overflow-hidden opacity-60`}>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mb-6">
                  {track.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-between">
                  {track.title}
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-slate-800 text-slate-400 rounded-md">Coming Soon</span>
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {track.description}
                </p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
