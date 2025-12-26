'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { graphAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import toast from 'react-hot-toast';
import FlowchartGraph from '@/components/graph/FlowChartGraph';

export default function KnowledgeGraphPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.teamID as string;
  
  const [graphData, setGraphData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!teamId) return;
    loadGraph();
  }, [teamId]);

  const loadGraph = async () => {
    try {
      const { data } = await graphAPI.getTeamGraph(teamId);
      setGraphData(data);
    } catch (error: any) {
      console.error('Load graph error:', error);
      toast.error('Failed to load knowledge graph');
      if (error.response?.status === 403) {
        router.push('/teams');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
    
    // Navigate based on node type
    if (node.type === 'experiment') {
      const expId = node.id.replace('exp-', '');
      router.push(`/experiments/${expId}`);
    } else if (node.type === 'paper') {
      // Show paper details in modal or navigate
      toast.success(`Paper: ${node.label}`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push(`/teams/${teamId}/experiments`)}
              className="text-blue-600 hover:text-blue-700 text-sm mb-2 flex items-center"
            >
              ← Back to Experiments
            </button>
            <h1 className="text-3xl font-bold text-gray-900">🕸️ Knowledge Graph</h1>
            <p className="text-gray-600 mt-1">
              Interactive flowchart showing relationships between experiments, papers, and methods
            </p>
          </div>

          {graphData?.stats && (
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Graph Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {graphData.stats.experiments}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Experiments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-600">
                    {graphData.stats.papers}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Papers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">
                    {graphData.stats.users}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {graphData.stats.connections}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Connections</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div 
          className="bg-white rounded-lg shadow-xl border-2 border-gray-200" 
          style={{ height: 'calc(100vh - 250px)', minHeight: '700px' }}
        >
          {graphData && (
            <FlowchartGraph
              nodes={graphData.nodes}
              links={graphData.links}
              onNodeClick={handleNodeClick}
            />
          )}
        </div>

        {selectedNode && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <span className="text-2xl mr-2">
                    {selectedNode.type === 'experiment' ? '🔬' : 
                     selectedNode.type === 'paper' ? '📄' :
                     selectedNode.type === 'method' ? '⚙️' :
                     selectedNode.type === 'metric' ? '📊' : '👤'}
                  </span>
                  {selectedNode.label}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Type:</strong> <span className="uppercase text-blue-600">{selectedNode.type}</span></p>
                  {selectedNode.data && Object.entries(selectedNode.data).map(([key, value]) => (
                    <p key={key}>
                      <strong className="capitalize">{key}:</strong> {String(value)}
                    </p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
