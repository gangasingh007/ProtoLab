'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTeamStore } from '@/lib/store';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentTeam } = useTeamStore();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/teams" className="text-2xl font-bold text-blue-600">
              ResearchWeb
            </Link>
            
            {currentTeam && (
              <>
                <Link
                  href={`/teams/${currentTeam.id}/experiments`}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Experiments
                </Link>
                <Link
                  href={`/teams/${currentTeam.id}/papers`}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Papers
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentTeam && (
              <span className="text-sm text-gray-600">
                Team: <span className="font-semibold">{currentTeam.name}</span>
              </span>
            )}
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
