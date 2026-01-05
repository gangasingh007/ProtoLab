'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Node,
  Edge,
  Position,
  Handle,
  NodeProps,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useRouter } from 'next/navigation';
import { graphAPI, teamsAPI } from '@/lib/api';
import { KnowledgeGraph, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  GitBranch, 
  FileText, 
  FlaskConical, 
  Tag, 
  Network,
  Layout,
  Maximize,
  ArrowRight,
  X,
  Search,
  ZoomIn,
  ZoomOut,
  MoreHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// --- 1. Custom Node Component ---
// This defines how every single node looks on the canvas
const ResearchNode = ({ data, selected }: NodeProps) => {
  const isExperiment = data.type === 'experiment';
  const isPaper = data.type === 'paper';
  
  const icon = isExperiment ? <FlaskConical className="w-4 h-4" /> : 
               isPaper ? <FileText className="w-4 h-4" /> : 
               <Tag className="w-4 h-4" />;
               
  const colorClass = isExperiment ? "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400" :
                     isPaper ? "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/50 dark:border-teal-800 dark:text-teal-400" :
                     "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400";

  return (
    <div className={cn(
      "w-[280px] rounded-xl border bg-card shadow-sm transition-all duration-200 group",
      selected ? "ring-2 ring-primary border-primary shadow-lg scale-105" : "hover:border-primary/50",
      colorClass
    )}>
      {/* Input Handle (Left or Top) */}
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-2 !h-2" />

      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
            <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider", colorClass)}>
                {icon}
                <span>{data.type}</span>
            </div>
            {data.status && (
               <Badge variant="outline" className="text-[10px] h-5 bg-background/50">
                 {data.status}
               </Badge>
            )}
        </div>
        
        <h3 className="font-bold text-sm leading-snug text-foreground line-clamp-2 mb-1">
          {data.label}
        </h3>
        
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
            <span>ID: {data.id.substring(0,6)}</span>
            {selected && <span className="text-primary font-medium flex items-center gap-1">View Details <ArrowRight className="w-2 h-2" /></span>}
        </div>
      </div>

      {/* Output Handle (Right or Bottom) */}
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
};

// --- 2. Layout Logic (Dagre) ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => { // Default to Top-Bottom for hierarchies
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 300, height: 120 }); // Match CustomNode dimensions approx
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - 150,
        y: nodeWithPosition.y - 60,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// --- 3. Main Page Component ---
export default function KnowledgeGraphPage() {
  return (
    <ReactFlowProvider>
      <GraphContent />
    </ReactFlowProvider>
  );
}

function GraphContent() {
  const router = useRouter();
  const reactFlowInstance = useReactFlow();

  // State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Register Custom Node
  const nodeTypes = useMemo(() => ({ researchNode: ResearchNode }), []);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadGraph(selectedTeam);
    }
  }, [selectedTeam]);

  // Keyboard shortcut to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedNode(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      processGraphData(data);
    } catch (error) {
      // toast.error('Failed to load graph data'); 
    } finally {
      setIsLoading(false);
    }
  };

  const processGraphData = (data: KnowledgeGraph) => {
    if (!data || !data.nodes) return;

    const flowNodes: Node[] = data.nodes.map((node: any) => ({
      id: node.id,
      type: 'researchNode', // Use our custom component
      data: { 
        ...node,
        label: node.label,
        type: node.type,
        status: node.status || 'Active'
      },
      position: { x: 0, y: 0 } // Layout will overwrite this
    }));

    const flowEdges: Edge[] = data.links.map((link: any, i: number) => ({
      id: `e-${i}`,
      source: link.source,
      target: link.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      layoutDirection
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    // Fit view after a slight delay to allow rendering
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 50);
  };

  const handleLayoutChange = (direction: 'TB' | 'LR') => {
    setLayoutDirection(direction);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      direction
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 800 }), 10);
  };

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    
    // Center logic (optional)
    reactFlowInstance.setCenter(node.position.x + 150, node.position.y + 60, { zoom: 1.2, duration: 800 });
  };

  const handleSearch = () => {
    const node = nodes.find(n => n.data.label.toLowerCase().includes(searchQuery.toLowerCase()));
    if (node) {
        setSelectedNode(node);
        reactFlowInstance.setCenter(node.position.x + 150, node.position.y + 60, { zoom: 1.5, duration: 800 });
    } else {
        toast.error("Node not found");
    }
  };

  return (
    <div className="flex h-screen dark:bg-black overflow-hidden relative">
      
      {/* 1. Sidebar Panel (Inspector) - Slides in when node selected */}
      <div className={cn(
          "absolute right-0 top-0 bottom-0 w-[400px] bg-background/95 backdrop-blur-sm border-l border-border z-20 shadow-2xl transform transition-transform duration-300 ease-in-out p-6 overflow-y-auto",
          selectedNode ? "translate-x-0" : "translate-x-full"
      )}>
          {selectedNode && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
                  <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg bg-muted", selectedNode.data.type === 'experiment' ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700")}>
                           {selectedNode.data.type === 'experiment' ? <FlaskConical className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <Badge variant="outline">{selectedNode.data.type}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
                          <X className="w-5 h-5 text-muted-foreground" />
                      </Button>
                  </div>

                  <div>
                      <h2 className="text-2xl text-white font-bold mb-2">{selectedNode.data.label}</h2>
                      <p className="text-muted-foreground text-sm">
                          ID: <span className="font-mono">{selectedNode.id}</span>
                      </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          const cleanId = selectedNode.id.replace(/^(exp-|paper-)/, '');
                          router.push(`/${selectedNode.data.type}s/${cleanId}`);
                        }}
                      >
                        View Full Details
                      </Button>
                      <Button variant="outline" className="text-white w-full">
                        Edit Node
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <span className="font-medium">{selectedNode.data.status || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Created</span>
                              <span className="font-medium">Today</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-muted-foreground">Author</span>
                              <span className="font-medium">Current User</span>
                          </div>
                      </CardContent>
                  </Card>
              </div>
          )}
      </div>

      {/* 2. Main Graph Area */}
      <div className="flex-1 relative">
         
         {/* Top Bar (Transparent) */}
         <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start pointer-events-none">
             {/* Left: Branding */}
             <div className="flex items-center gap-3 pointer-events-auto bg-background/80 backdrop-blur p-2 pr-4 rounded-xl border shadow-sm">
                 <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <GitBranch className="w-5 h-5" />
                 </div>
                 <div>
                    <h1 className="font-bold text-white text-sm">Research Flow</h1>
                    <div className="flex items-center gap-2">
                         <span className={cn("w-2 h-2 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : "bg-teald-500")} />
                         <span className="text-[10px] text-muted-foreground">{isLoading ? 'Syncing...' : 'Live'}</span>
                    </div>
                 </div>
             </div>

             {/* Right: Team Select */}
             <div className="pointer-events-auto bg-background/80 backdrop-blur p-1 rounded-xl border shadow-sm">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-[200px] border-none shadow-none bg-transparent">
                    <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent className="text-primary">
                    {teams.map(t => <SelectItem className="text-primary" key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
         </div>

         {/* Bottom Dock (Controls) */}
         <div className="absolute text bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl">
             <Button variant="ghost" size="icon" onClick={() => reactFlowInstance.zoomIn()} className="rounded-xl text-white">
                 <ZoomIn className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => reactFlowInstance.zoomOut()} className="rounded-xl text-white">
                 <ZoomOut className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => reactFlowInstance.fitView()} className="rounded-xl text-white">
                 <Maximize className="w-5 h-5" />
             </Button>
             <div className="w-px h-6 bg-border mx-1" />
             <Button 
            
                variant={layoutDirection === 'TB' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => handleLayoutChange('TB')}
                className="rounded-xl text-white"
                title="Vertical Layout"
             >
                 <Layout className="w-5 h-5 rotate-180" />
             </Button>
             <Button 
                variant={layoutDirection === 'LR' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => handleLayoutChange('LR')}
                className="rounded-xl text-white"
                title="Horizontal Layout"
             >
                 <Layout className="w-5 h-5 -rotate-90" />
             </Button>
             <div className="w-px h-6 bg-border mx-1" />
             <div className="relative">
                 <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                 <Input 
                    className="w-48 h-9 pl-9 text-white rounded-xl border-none bg-muted/50 focus:bg-background transition-colors"
                    placeholder="Search node..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                 />
             </div>
         </div>

         {/* Graph Canvas */}
         <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            minZoom={0.1}
            fitView
            className="bg-slate-50/50 dark:bg-card/80"
         >
            <Background color="#cbd5e1" gap={20} size={1} />
         </ReactFlow>
      </div>
    </div>
  );
}