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
      
      {/* 2. Sidebar wrapper - allow Sidebar to control width (supports collapsed state) */}
      <aside className="flex-none hidden md:block ">
        <Sidebar />
      </aside>

      {/* 3. Main Content Area - Grow to fill space, scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden ">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}