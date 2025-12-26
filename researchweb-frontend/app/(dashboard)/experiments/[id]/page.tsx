'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useExperimentStore } from '@/lib/store';
import { experimentsAPI, commentsAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/shared/Button';
import { Comment } from '@/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experimentId = params.id as string;
  const { currentExperiment, setCurrentExperiment, updateExperiment } = useExperimentStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  const { socket, emitExperimentUpdate } = useSocket(experimentId);

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('comment-added', (data: { comment: Comment }) => {
      if (currentExperiment) {
        setCurrentExperiment({
          ...currentExperiment,
          comments: [...(currentExperiment.comments || []), data.comment],
        });
      }
    });

    socket.on('experiment-changed', (data: any) => {
      toast.success(`${data.userName} updated the experiment`);
      loadExperiment();
    });

    return () => {
      socket.off('comment-added');
      socket.off('experiment-changed');
    };
  }, [socket, currentExperiment]);

  const loadExperiment = async () => {
    try {
      const { data } = await experimentsAPI.getExperiment(experimentId);
      setCurrentExperiment(data);
      setEditedData(data);
    } catch (error) {
      toast.error('Failed to load experiment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await experimentsAPI.updateExperiment(experimentId, editedData);
      setCurrentExperiment(data);
      updateExperiment(experimentId, data);
      emitExperimentUpdate(editedData);
      toast.success('Experiment updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update experiment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsCommenting(true);
    try {
      await commentsAPI.createComment({
        content: newComment,
        experimentId,
      });
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const { data } = await experimentsAPI.updateExperiment(experimentId, { status });
      setCurrentExperiment(data);
      updateExperiment(experimentId, data);
      emitExperimentUpdate({ status });
      toast.success(`Status changed to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
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

  if (!currentExperiment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-gray-600">Experiment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 text-sm mb-4"
          >
            ← Back to Experiments
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.title}
                    onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                    placeholder={currentExperiment.title}
                    className="text-2xl font-bold w-full border-b-2 border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">{currentExperiment.title}</h1>
                )}
                
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="secondary">
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={() => setIsEditing(false)} variant="secondary">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving}>
                      Save
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>By {currentExperiment.author.name}</span>
                <span>•</span>
                <span>
                  Updated {formatDistanceToNow(new Date(currentExperiment.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Hypothesis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Hypothesis</h2>
              {isEditing ? (
                <textarea
                  placeholder='Describe your hypothesis here...'
                  value={editedData.hypothesis || ''}
                  onChange={(e) => setEditedData({ ...editedData, hypothesis: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-700">{currentExperiment.hypothesis || 'No hypothesis provided'}</p>
              )}
            </div>

            {/* Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Method</h2>
              {isEditing ? (
                <textarea
                  value={editedData.method || ''}
                  placeholder='Describe your experimental method here...'
                  onChange={(e) => setEditedData({ ...editedData, method: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{currentExperiment.method || 'No method provided'}</p>
              )}
            </div>

            {/* Observations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Observations</h2>
              {isEditing ? (
                <textarea
                  value={editedData.observations || ''}
                  onChange={(e) => setEditedData({ ...editedData, observations: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Document your observations here..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{currentExperiment.observations || 'No observations yet'}</p>
              )}
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Results</h2>
              {isEditing ? (
                <textarea
                  value={editedData.results || ''}
                  onChange={(e) => setEditedData({ ...editedData, results: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Document your results here..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{currentExperiment.results || 'No results yet'}</p>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h2>
              
              <form onSubmit={handleAddComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
                  placeholder="Add a comment or mention someone with @"
                />
                <Button type="submit" isLoading={isCommenting}>
                  Add Comment
                </Button>
              </form>

              <div className="space-y-4">
                {currentExperiment.comments?.map((comment) => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{comment.author.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
              <select
                title='Change Experiment Status'
                value={currentExperiment.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="COMPLETE">Complete</option>
              </select>
            </div>

            {/* Linked Papers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Linked Papers</h3>
              {currentExperiment.experimentPapers && currentExperiment.experimentPapers.length > 0 ? (
                <ul className="space-y-2">
                  {currentExperiment.experimentPapers.map((ep) => (
                    <li key={ep.id} className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {ep.paper.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No papers linked yet</p>
              )}
            </div>

            {/* Tags */}
            {currentExperiment.tags && currentExperiment.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentExperiment.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
