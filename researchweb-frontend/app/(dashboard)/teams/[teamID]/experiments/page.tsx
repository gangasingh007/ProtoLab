'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExperimentStore, useTeamStore } from '@/lib/store';
import { experimentsAPI, teamsAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/shared/Button';
import { Experiment } from '@/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ExperimentsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamID as string;
  const { experiments, setExperiments } = useExperimentStore();
  const { currentTeam, setCurrentTeam } = useTeamStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    title: '',
    hypothesis: '',
    method: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      const [experimentsRes, teamRes] = await Promise.all([
        experimentsAPI.getTeamExperiments(teamId),
        teamsAPI.getTeam(teamId),
      ]);
      setExperiments(experimentsRes.data);
      setCurrentTeam(teamRes.data);
    } catch (error) {
      toast.error('Failed to load experiments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data } = await experimentsAPI.createExperiment({
        ...newExperiment,
        teamId,
      });
      setExperiments([data, ...experiments]);
      toast.success('Experiment created successfully!');
      setShowCreateModal(false);
      setNewExperiment({ title: '', hypothesis: '', method: '' });
      router.push(`/experiments/${data.id}`);
    } catch (error) {
      toast.error('Failed to create experiment');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExperiments = experiments.filter((exp) => {
    if (filter === 'all') return true;
    return exp.status === filter;
  });

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
            <p className="text-gray-600 mt-1">{currentTeam?.name}</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            New Experiment
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({experiments.length})
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('BLOCKED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'BLOCKED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Blocked
          </button>
          <button
            onClick={() => setFilter('COMPLETE')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'COMPLETE'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Complete
          </button>
        </div>

        {/* Experiments List */}
        {filteredExperiments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No experiments found</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create First Experiment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExperiments.map((experiment) => (
              <div
                key={experiment.id}
                onClick={() => router.push(`/experiments/${experiment.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {experiment.title}
                    </h3>
                    {experiment.hypothesis && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        <span className="font-medium">Hypothesis:</span> {experiment.hypothesis}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By {experiment.author.name}</span>
                      <span>•</span>
                      <span>
                        Updated {formatDistanceToNow(new Date(experiment.updatedAt), { addSuffix: true })}
                      </span>
                      {experiment.comments && experiment.comments.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{experiment.comments.length} comments</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(experiment.status)}`}>
                    {experiment.status.replace('_', ' ')}
                  </span>
                </div>
                
                {experiment.tags && experiment.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {experiment.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Experiment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Experiment</h2>
            <form onSubmit={handleCreateExperiment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiment Title *
                </label>
                <input
                  type="text"
                  value={newExperiment.title}
                  onChange={(e) => setNewExperiment({ ...newExperiment, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Testing ResNet-50 on Medical Images"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hypothesis
                </label>
                <textarea
                  value={newExperiment.hypothesis}
                  onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What do you expect to find?"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Method
                </label>
                <textarea
                  value={newExperiment.method}
                  onChange={(e) => setNewExperiment({ ...newExperiment, method: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How will you test your hypothesis?"
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
                  Create Experiment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
