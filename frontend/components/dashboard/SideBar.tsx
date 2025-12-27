'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  PlusCircle
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
];

const secondaryNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/support', icon: LifeBuoy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
  };

  return (
    <div className="flex flex-col h-full w-[280px] bg-card/95 backdrop-blur-sm border-r border-border relative">
      
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <Link href="/teams" className="flex items-center gap-3 group">
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-primary">ProtoLab</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Research Suite</span>
          </div>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <Button variant="outline" className="w-full justify-start gap-2 shadow-sm border-dashed">
          <PlusCircle className="w-4 h-4 text-primary" />
          <span className="font-medium text-white">New Project</span>
        </Button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 space-y-6 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-muted">
        
        {/* Primary Links */}
        <nav className="space-y-1">
          <p className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
            Workspace
          </p>
          {mainNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon 
                  className={cn(
                    "w-4 h-4 transition-colors", 
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Links */}
        <nav className="space-y-1">
          <p className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
            System
          </p>
          {secondaryNav.map((item) => {
             const isActive = pathname.startsWith(item.href);
             return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                   isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                {item.name}
              </Link>
             )
          })}
        </nav>

        {/* Usage Widget (Mock Data) */}
        <div className="mt-auto pt-4">
          <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span className="text-xs font-semibold text-foreground">Pro Plan</span>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Storage</span>
                <span>75%</span>
              </div>
              
              <Progress value={75} className="h-1.5 bg-muted"
                // @ts-ignore
              indicatorClassName="bg-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              15.2 GB of 20 GB used
            </p>
          </div>
        </div>
      </div>

      {/* User Footer with Dropdown */}
      <div className="p-4 mt-auto border-t border-border/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full h-auto p-2 flex items-center justify-between hover:bg-muted/50 rounded-xl group">
              <div className="flex items-center gap-3 text-left">
                <Avatar className="h-9 w-9 border border-border/50 group-hover:border-primary/50 transition-colors">
                  <AvatarImage src="https://static.vecteezy.com/system/resources/thumbnails/015/407/577/small/doctor-round-avatar-medicine-flat-avatar-with-male-doctor-medical-clinic-team-round-icon-medical-collection-illustration-vector.jpg" />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
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