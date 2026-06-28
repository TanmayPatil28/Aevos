import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";

export default async function AdminDashboard() {
  const waitlist = await prisma.waitlist.findMany({
    orderBy: { createdAt: "desc" },
  });

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-[1400px] mx-auto w-full pt-20">
      <h1 className="text-4xl font-bold text-white tracking-tight mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waitlist Section */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 flex flex-col h-[70vh]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Waitlist</h2>
            <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold">
              {waitlist.length} users
            </div>
          </div>
          <div className="overflow-y-auto pr-2 space-y-4 scrollbar-hide flex-1">
            {waitlist.map((entry) => (
              <div key={entry.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white font-medium">{entry.email}</span>
                <span className="text-[#86868B] text-sm">
                  {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
                </span>
              </div>
            ))}
            {waitlist.length === 0 && <p className="text-[#86868B]">No waitlist entries yet.</p>}
          </div>
        </section>

        {/* Feedback Section */}
        <section className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 flex flex-col h-[70vh]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Feedback</h2>
            <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
              {feedbacks.length} reports
            </div>
          </div>
          <div className="overflow-y-auto pr-2 space-y-4 scrollbar-hide flex-1">
            {feedbacks.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= item.rating ? "fill-yellow-500 text-yellow-500" : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[#86868B] text-sm">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">{item.message}</p>
              </div>
            ))}
            {feedbacks.length === 0 && <p className="text-[#86868B]">No feedback submitted yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
