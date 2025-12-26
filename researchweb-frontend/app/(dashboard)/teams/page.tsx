'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/lib/store';
import { teamsAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/shared/Button';
import { Team } from '@/types';
import toast from 'react-hot-toast';

export default function TeamsPage() {
  const router = useRouter();
  const { teams, setTeams, setCurrentTeam } = useTeamStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const { data } = await teamsAPI.getMyTeams();
      setTeams(data);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data } = await teamsAPI.createTeam({
        name: newTeamName,
        description: newTeamDesc,
      });
      setTeams([...teams, data]);
      toast.success('Team created successfully!');
      setShowCreateModal(false);
      setNewTeamName('');
      setNewTeamDesc('');
    } catch (error) {
      toast.error('Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectTeam = (team: Team) => {
    setCurrentTeam(team);
    router.push(`/teams/${team.id}/experiments`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
            <p className="text-gray-600 mt-1">Select a team to start collaborating</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            Create New Team
          </Button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">You're not part of any teams yet</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => handleSelectTeam(team)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {team.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {team.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{team.members?.length || 0} members</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {team.userRole}
                  </span>
                </div>
                
                {team._count && (
                  <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                    <span className="text-gray-600">
                      {team._count.experiments} experiments
                    </span>
                    <span className="text-gray-600">
                      {team._count.papers} papers
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AI Research Lab"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What does your team work on?"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isCreating}
                  className="flex-1"
                >
                  Create Team
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
