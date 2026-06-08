export default function WorkspaceLoading() {
  return (
    <div className="w-full h-full flex flex-col gap-8 p-6 md:p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="h-10 w-48 bg-white/10 rounded-lg"></div>
        <div className="h-5 w-96 bg-white/5 rounded-md"></div>
      </div>
      
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-36 bg-[#0A0A0A] rounded-2xl border border-white/5"></div>
        <div className="h-36 bg-[#0A0A0A] rounded-2xl border border-white/5"></div>
        <div className="h-36 bg-[#0A0A0A] rounded-2xl border border-white/5"></div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 w-full bg-[#0A0A0A] rounded-2xl border border-white/5 min-h-[400px]"></div>
    </div>
  );
}
