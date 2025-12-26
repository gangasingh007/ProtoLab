'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { graphAPI, teamsAPI } from '@/lib/api';
import { KnowledgeGraph, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Network, 
  Info, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RefreshCw,
  Share2,
  Layers,
  MousePointer2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes'; // Optional: for theme-aware graph colors

// Dynamically import ForceGraph to prevent SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-medium uppercase tracking-wider">Initializing Physics Engine...</span>
      </div>
    </div>
  ),
});

export default function KnowledgeGraphPage() {
  const router = useRouter();
  //@ts-ignore
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // If you use next-themes

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightNodes, setHighlightNodes] = useState(new Set());

  // Resize Observer for responsive graph
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions(); // Initial calc
    
    // Slight delay to ensure container is rendered
    const timeout = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadGraph(selectedTeam);
    }
  }, [selectedTeam]);

  // Search Filtering
  useEffect(() => {
    if (!graphData) return;
    const query = searchQuery.toLowerCase();
    const matches = new Set();
    
    if (query) {
      graphData.nodes.forEach(node => {
        if (node.label.toLowerCase().includes(query)) {
          matches.add(node.id);
        }
      });
    }
    setHighlightNodes(matches);
  }, [searchQuery, graphData]);

  const loadTeams = async () => {
    try {
      const data = await teamsAPI.getMyTeams();
      setTeams(data);
      if (data.length > 0) setSelectedTeam(data[0].id);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGraph = async (teamId: string) => {
    setIsLoading(true);
    try {
      const data = await graphAPI.getTeamGraph(teamId);
      setGraphData(data);
      // Zoom to fit after data load
      setTimeout(() => handleZoomToFit(), 500);
    } catch (error) {
      toast.error('Failed to load knowledge graph');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Graph Interactions ---

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2, 400);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.2, 400);
    }
  };

  const handleZoomToFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 20);
    }
  };

  const handleNodeClick = (node: any) => {
    // Focus camera on node
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(2.5, 1000);
    }

    // Navigate (optional, maybe distinct 'View' button is better?)
    // setTimeout(() => {
    //   if (node.type === 'experiment') router.push(`/experiments/${node.id}`);
    //   if (node.type === 'paper') router.push(`/papers/${node.id}`);
    // }, 1500);
    
    toast(`Selected: ${node.label}`, { icon: '📍' });
  };

  // --- Rendering Logic ---

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      experiment: '#3b82f6', // blue-500
      paper: '#10b981',      // emerald-500
      method: '#f59e0b',     // amber-500
      metric: '#8b5cf6',     // violet-500
      user: '#ec4899',       // pink-500
      tag: '#6366f1',        // indigo-500
    };
    return colors[type] || '#9ca3af';
  };

  // Custom Node Rendering (Canvas API)
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const color = getNodeColor(node.type);
    const isHighlighted = highlightNodes.has(node.id);
    const baseSize = 4;
    
    // Dynamic sizing based on connections or importance (mocked here)
    const size = (node.val || 1) * baseSize; 

    // 1. Draw Glow (if highlighted or hovered)
    if (isHighlighted) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 2.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = color + '33'; // 20% opacity hex
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 1.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = color + '66'; // 40% opacity
      ctx.fill();
    }

    // 2. Draw Main Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // 3. Draw Border
    ctx.strokeStyle = '#ffffff'; // White border
    ctx.lineWidth = 1.5 / globalScale;
    ctx.stroke();

    // 4. Draw Label
    // Only draw label if zoomed in enough or highlighted
    if (globalScale > 1.2 || isHighlighted) {
      const fontSize = isHighlighted ? 14 / globalScale : 10 / globalScale;
      ctx.font = `${isHighlighted ? 'bold' : ''} ${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      
      // Label Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(node.x - textWidth / 2 - 2, node.y + size + 2, textWidth + 4, fontSize + 4);

      // Label Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, node.x, node.y + size + 4);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* 1. Header Toolbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
           <div className="p-2 bg-primary/20 rounded-lg text-primary">
             <Share2 className="w-5 h-5" />
           </div>
           <div>
             <h1 className="text-lg font-bold tracking-tight">Knowledge Graph</h1>
             <p className="text-xs text-slate-400">Interactive data exploration</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden md:block">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
             <Input 
                placeholder="Find node..." 
                className="pl-9 h-9 bg-slate-800 border-slate-700 text-slate-200 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <Separator orientation="vertical" className="h-6 bg-slate-700" />
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48 h-9 bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
              {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* 2. Main Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Floating Controls */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 p-1 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg shadow-xl">
           <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-slate-300 hover:text-white hover:bg-slate-800">
             <ZoomIn className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-slate-300 hover:text-white hover:bg-slate-800">
             <ZoomOut className="w-5 h-5" />
           </Button>
           <Separator className="bg-slate-700" />
           <Button variant="ghost" size="icon" onClick={handleZoomToFit} className="text-slate-300 hover:text-white hover:bg-slate-800">
             <Maximize className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" onClick={() => loadGraph(selectedTeam)} className="text-slate-300 hover:text-white hover:bg-slate-800">
             <RefreshCw className="w-5 h-5" />
           </Button>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 z-10 p-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl shadow-xl max-w-xs">
           <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-200">
             <Layers className="w-4 h-4 text-primary" />
             <span>Graph Legend</span>
           </div>
           <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { type: 'experiment', label: 'Experiments' },
                { type: 'paper', label: 'Papers' },
                { type: 'method', label: 'Methods' },
                { type: 'metric', label: 'Metrics' },
                { type: 'tag', label: 'Tags' },
                { type: 'user', label: 'Users' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: getNodeColor(item.type) }} />
                  <span>{item.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Graph Container */}
        <div ref={containerRef} className="flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black cursor-move">
          {!isLoading && graphData ? (
            <ForceGraph2D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              
              // Physics
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}

              // Rendering
              nodeLabel="label"
              nodeCanvasObject={drawNode}
              
              // Links
              linkColor={() => '#334155'} // slate-700
              linkWidth={1}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleSpeed={0.005}

              // Interaction
              onNodeClick={handleNodeClick}
              backgroundColor="transparent" // Let CSS gradient show
            />
          ) : (
            <div className="h-full flex items-center justify-center">
               {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                     <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <Network className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary" />
                     </div>
                     <p className="text-slate-400 font-mono text-sm animate-pulse">Loading Graph Data...</p>
                  </div>
               ) : (
                  <div className="text-center p-8 border border-slate-800 rounded-xl bg-slate-900/50">
                     <Network className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                     <h3 className="text-lg font-semibold text-slate-300">No Data Available</h3>
                     <p className="text-slate-500 text-sm mt-2 max-w-xs">
                       Start adding experiments and papers to populate the graph.
                     </p>
                  </div>
               )}
            </div>
          )}
        </div>

        {/* Right Info Panel (Optional/Collapsible) */}
        <div className="hidden xl:block w-80 border-l border-slate-800 bg-slate-900/30 backdrop-blur p-6 overflow-y-auto">
             <div className="space-y-6">
                <div>
                   <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Statistics</h3>
                   {graphData && (
                     <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Nodes" value={graphData.stats?.totalNodes || 0} />
                        <StatCard label="Edges" value={graphData.stats?.totalEdges || 0} />
                        <StatCard label="Experiments" value={graphData.stats?.experimentCount || 0} />
                        <StatCard label="Papers" value={graphData.stats?.paperCount || 0} />
                     </div>
                   )}
                </div>
                
                <Separator className="bg-slate-800" />
                
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Controls</h3>
                   <div className="space-y-3 text-sm text-slate-400">
                      <div className="flex items-center gap-3">
                         <MousePointer2 className="w-4 h-4 text-primary" />
                         <span>Click & Drag to pan</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Maximize className="w-4 h-4 text-primary" />
                         <span>Scroll to zoom</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Info className="w-4 h-4 text-primary" />
                         <span>Click node for details</span>
                      </div>
                   </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}

// Simple Stat Card Helper
function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg">
       <div className="text-2xl font-bold text-white">{value}</div>
       <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}