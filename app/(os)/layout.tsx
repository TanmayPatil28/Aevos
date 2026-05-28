import OSNavbar from "@/components/os/navigation/OSNavbar";
import OSContextBar from "@/components/os/navigation/OSContextBar";
import OSMobileNav from "@/components/os/navigation/OSMobileNav";
import OSInspector from "@/components/os/inspector/OSInspector";

export default function OSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative selection:bg-indigo-500/30">
      {/* Top Floating Navigation */}
      <div className="sticky top-0 z-50 pt-4 pb-2 px-4 pointer-events-none">
        <OSNavbar />
      </div>

      {/* Dynamic Context Bar */}
      <OSContextBar />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col relative z-0">
        {children}
      </main>

      <OSInspector />
      <OSMobileNav />
    </div>
  );
}
