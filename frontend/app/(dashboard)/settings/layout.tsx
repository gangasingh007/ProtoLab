'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Bell, Shield, Palette, Key, Database, ChevronRight, Settings } from 'lucide-react';
import { Router } from 'next/router';

const settingsSections = [
  { name: 'Profile', href: '/settings', icon: User, description: 'Manage your public profile' },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell, description: 'Email and push preferences' },
  { name: 'Security', href: '/settings/security', icon: Shield, description: '2FA and password' },
  { name: 'Appearance', href: '/settings/appearance', icon: Palette, description: 'Theme preferences' },
  { name: 'API Keys', href: '/settings/api-keys', icon: Key, description: 'Manage access tokens' },
  { name: 'Data & Privacy', href: '/settings/privacy', icon: Database, description: 'Export data and GDPR' },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="h-full flex flex-col bg-[#171717] text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* Header */}
      <div className="border-b border-white/5 bg-[#171717]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="px-8 py-5">
           <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">
               <span onClick={()=>router.push("/")} className="cursor-pointer hover:text-slate-300">DashBoard</span> 
               <ChevronRight className="w-3 h-3" />
               <span className="text-teal-500">Configuration</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-[#151921] rounded-lg border border-white/10">
                <Settings className="w-5 h-5 text-teal-500" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-xs text-slate-400">Manage your account preferences and workspace configuration</p>
             </div>
           </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Settings Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-[#0B0E14]/50 hidden md:block overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Account</h3>
            {settingsSections.map((section) => {
              const isActive = pathname === section.href;
              return (
                <button
                  key={section.name}
                  onClick={() => router.push(section.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group relative',
                    isActive
                      ? 'bg-teal-500/10 text-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )}
                >
                  <section.icon className={cn("w-4 h-4", isActive ? "text-teal-500" : "text-slate-500 group-hover:text-slate-400")} />
                  <div className="flex-1">
                      <span className="text-sm font-medium block">{section.name}</span>
                  </div>
                  {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-teal-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#171717]/90 relative">
          {children}
        </main>
      </div>
    </div>
  );
}