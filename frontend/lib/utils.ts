import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes without conflicts.
 * Required for Shadcn UI components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to "Jan 1, 2024"
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date string to "Jan 1, 2024, 12:00 PM"
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generates initials from a name (e.g. "John Doe" -> "JD")
 */
export function getInitials(name: string = ''): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Returns color classes for Experiment Status
 */
export function getStatusColor(status: string): string {
  const normalizedStatus = status?.toUpperCase() || '';
  
  const colors: Record<string, string> = {
    // Experiment Statuses
    PLANNED: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    BLOCKED: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  };

  return colors[normalizedStatus] || 'bg-slate-100 text-slate-600 border-slate-200';
}

/**
 * Returns color classes for User Roles
 */
export function getRoleColor(role: string): string {
  const normalizedRole = role?.toUpperCase() || '';

  const colors: Record<string, string> = {
    // Roles from your Register Page
    LAB_MANAGER: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    FACULTY: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
    STUDENT: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
    
    // Generic Fallbacks
    OWNER: 'bg-amber-50 text-amber-700 border-amber-200',
    ADMIN: 'bg-red-50 text-red-700 border-red-200',
    MEMBER: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return colors[normalizedRole] || 'bg-slate-100 text-slate-500 border-slate-200';
}

/**
 * Simulate delay for dev/testing
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}