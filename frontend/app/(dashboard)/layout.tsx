// app/dashboard/layout.tsx (or wherever your route is)

import { Sidebar } from "@/components/dashboard/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Flex container for the whole screen
    <div className="flex h-screen overflow-hidden bg-slate-950"> 
      
      {/* 2. Sidebar wrapper - Fixed width, no scrolling */}
      <aside className="w-[280px] flex-none hidden md:block border-r border-slate-800">
        <Sidebar />
      </aside>

      {/* 3. Main Content Area - Grow to fill space, scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}