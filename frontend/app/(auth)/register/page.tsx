'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Microscope, 
  School 
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, typical in Shadcn

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'LAB_MANAGER'>('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mocking register for display if hook isn't available in this context
  const { register } = useAuth() || { register: async () => {} };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({ name, email, password, role });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      
      {/* Background Decoration: Subtle Grid/Dots */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center mb-4">
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to <span className='text-primary'>ProtoLab</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Join the research collaboration platform tailored for modern laboratories.
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-center">Create your <span className="text-primary">Account</span></CardTitle>
            <CardDescription>
              Enter your details below to setup your workspace access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-background/50 focus:bg-background transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 bg-background/50 focus:bg-background transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Enhanced Role Selection */}
              <div className="space-y-3">
                <Label>I am a...</Label>
                <div className="grid grid-cols-3 gap-3">
                  <RoleCard 
                    selected={role === 'STUDENT'} 
                    onClick={() => setRole('STUDENT')}
                    icon={<GraduationCap className="w-5 h-5 mb-1" />}
                    label="Student"
                  />
                  <RoleCard 
                    selected={role === 'FACULTY'} 
                    onClick={() => setRole('FACULTY')}
                    icon={<School className="w-5 h-5 mb-1" />}
                    label="Faculty"
                  />
                  <RoleCard 
                    selected={role === 'LAB_MANAGER'} 
                    onClick={() => setRole('LAB_MANAGER')}
                    icon={<Microscope className="w-5 h-5 mb-1" />}
                    label="Manager"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Workspace...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-center w-full text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-semibold underline-offset-4 hover:underline transition-all"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

// Helper component for the Role selection cards
function RoleCard({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ease-in-out hover:bg-accent/50",
        selected 
          ? "border-primary bg-primary/5 text-primary shadow-sm" 
          : "border-border/50 text-muted-foreground hover:border-primary/50"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}