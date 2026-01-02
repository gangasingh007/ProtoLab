'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { 
  FlaskConical, 
  Users, 
  FileText, 
  Network, 
  Settings, 
  LogOut, 
  ChevronsUpDown, 
  Sparkles, 
  LifeBuoy,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress'; // Assuming you have shadcn progress component

const mainNav = [
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Experiments', href: '/experiments', icon: FlaskConical },
  { name: 'Papers', href: '/papers', icon: FileText },
  { name: 'Knowledge Graph', href: '/graph', icon: Network },
  {name : "Profile", href: '/profile', icon: User },
];

const secondaryNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/support', icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card/95 backdrop-blur-sm border-r border-border relative transition-all duration-200',
        collapsed ? 'w-20' : 'w-[280px]'
      )}
    >
      {/* Brand Header */}
      <div className={cn('p-4 pb-3 flex items-center gap-3', collapsed && 'justify-center')}>
        <Link href="/teams" className={cn('flex items-center gap-3 group', collapsed && 'justify-center')}>
          <div className={cn('flex flex-col', collapsed && 'hidden')}>
            <span className="text-lg font-bold tracking-tight text-primary">ProtoLab</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Research Suite</span>
          </div>
        </Link>

        <Button
          variant="ghost"
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto p-2 h-8 w-8"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="text-white w-4 h-4" /> : <ChevronLeft className="text-white w-4 h-4" />}
        </Button>
      </div>

      <div className="px-4 mb-4">
      </div>
      {/* Main Navigation */}
      <div className={cn('flex-1 px-4 space-y-6 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-muted')}>
        {/* Primary Links */}
        <nav className="space-y-1">
          <p className={cn('px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2', collapsed && 'hidden')}>
            Workspace
          </p>
          {mainNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed ? 'justify-center py-2' : 'px-3 py-2.5'
                )}
              >
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                    collapsed && 'mx-auto'
                  )}
                />
                {!collapsed && item.name}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Links */}
        <nav className="space-y-1">
          <p className={cn('px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2', collapsed && 'hidden')}>
            System
          </p>
          {secondaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed ? 'justify-center py-2' : 'px-3 py-2.5'
                )}
              >
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer with Dropdown */}
      <div className="p-4 mt-auto border-t border-border/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full h-auto p-2 flex items-center hover:bg-muted/50 rounded-xl group',
                collapsed ? 'justify-center' : 'justify-between'
              )}
            >
              <div className={cn('flex items-center gap-3 text-left', collapsed && 'justify-center')}>
                <Avatar className="h-9 w-9 border border-border/50 group-hover:border-primary/50 transition-colors">
                  <AvatarImage src="https://static.vecteezy.com/system/resources/thumbnails/015/407/577/small/doctor-round-avatar-medicine-flat-avatar-with-male-doctor-medical-clinic-team-round-icon-medical-collection-illustration-vector.jpg" />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.email || 'user@example.com'}
                    </span>
                  </div>
                )}
              </div>
              {!collapsed && <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100" />}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}