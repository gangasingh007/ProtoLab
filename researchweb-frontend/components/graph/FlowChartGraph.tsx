'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';

// --- Types ---
interface Node {
  id: string;
  label: string;
  type: 'experiment' | 'paper' | 'method' | 'metric' | 'user';
  status?: 'complete' | 'in-progress' | 'blocked' | 'planned';
  data?: any;
}

interface Link {
  source: string;
  target: string;
  type: string;
  label?: string;
}

interface FlowchartGraphProps {
  nodes: Node[];
  links: Link[];
  onNodeClick?: (node: Node) => void;
}

// --- Configuration ---
const NODE_WIDTH = 220;
const NODE_HEIGHT = 90;

const getTypeColor = (type: string) => {
  switch (type) {
    case 'experiment': return { border: '#22c55e', bg: '#f0fdf4', text: '#15803d' };
    case 'paper': return { border: '#06b6d4', bg: '#ecfeff', text: '#0e7490' };
    case 'method': return { border: '#f59e0b', bg: '#fffbeb', text: '#b45309' };
    case 'metric': return { border: '#a855f7', bg: '#faf5ff', text: '#7e22ce' };
    case 'user': return { border: '#ec4899', bg: '#fdf2f8', text: '#be185d' };
    default: return { border: '#9ca3af', bg: '#f9fafb', text: '#374151' };
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'complete': return 'bg-green-100 text-green-700';
    case 'in-progress': return 'bg-blue-100 text-blue-700';
    case 'blocked': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function FlowchartGraph({ nodes, links, onNodeClick }: FlowchartGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  // --- Resize Handler ---
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const { width, height } = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Graph Rendering ---
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // 1. Setup Dagre
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'TB',
      nodesep: 80, // Horizontal space between nodes
      ranksep: 100, // Vertical space between ranks
      marginx: 50,
      marginy: 50,
    });
    g.setDefaultEdgeLabel(() => ({}));

    // 2. Add Nodes to Dagre
    nodes.forEach(node => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // 3. Add Edges to Dagre
    links.forEach(link => {
      g.setEdge(link.source, link.target);
    });

    // 4. Calculate Layout
    dagre.layout(g);

    // 5. D3 Setup
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous

    // Define Arrowheads & Filters
    const defs = svg.append('defs');
    
    // Drop Shadow Filter
    const filter = defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%');
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3);
    filter.append('feOffset')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetblur');
    filter.append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.2); // Shadow opacity
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'offsetblur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow markers
    ['default', 'highlighted'].forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0) // We will offset this manually in the path
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', type === 'highlighted' ? '#3b82f6' : '#9ca3af');
    });

    // Container Group (for Zoom)
    const container = svg.append('g').attr('class', 'graph-container');

    // 6. Draw Edges (Links)
    const edgesGroup = container.append('g').attr('class', 'edges');
    
    edgesGroup.selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('id', d => `edge-${d.source}-${d.target}`)
      .attr('d', d => {
        const edge = g.edge(d.source, d.target);
        const points = edge.points;
        // Basic curve interpolation
        const lineGen = d3.line<{ x: number, y: number }>()
          .x(p => p.x)
          .y(p => p.y)
          .curve(d3.curveBasis);
        return lineGen(points);
      })
      .attr('fill', 'none')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow-default)')
      .style('transition', 'all 0.3s ease');

    // Edge Labels
    edgesGroup.selectAll('text')
      .data(links.filter(l => l.label))
      .enter()
      .append('text')
      .attr('x', d => {
        const edge = g.edge(d.source, d.target);
        return edge.points[Math.floor(edge.points.length / 2)].x;
      })
      .attr('y', d => {
        const edge = g.edge(d.source, d.target);
        return edge.points[Math.floor(edge.points.length / 2)].y;
      })
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('font-size', 10)
      .attr('fill', '#6b7280')
      .attr('class', 'bg-white')
      .text(d => d.label || '');

    // 7. Draw Nodes (Using foreignObject for HTML content)
    const nodesGroup = container.append('g').attr('class', 'nodes');

    const nodeSelection = nodesGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => {
        const n = g.node(d.id);
        // Dagre coordinates are center, foreignObject needs top-left
        return `translate(${n.x - NODE_WIDTH / 2}, ${n.y - NODE_HEIGHT / 2})`;
      })
      .style('cursor', 'pointer')
      .on('click', (e, d) => onNodeClick && onNodeClick(d))
      .on('mouseenter', (e, d) => setHighlightedNode(d.id))
      .on('mouseleave', () => setHighlightedNode(null));

    // Render HTML inside SVG
    nodeSelection.append('foreignObject')
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .style('overflow', 'visible') // Allow shadow to spill
      .append('xhtml:div')
      .html(d => {
        const colors = getTypeColor(d.type);
        const statusClass = getStatusColor(d.status);
        const icon = d.type === 'experiment' ? '🔬' : d.type === 'paper' ? '📄' : d.type === 'metric' ? '📊' : '📌';
        
        return `
          <div class="w-full h-full bg-white rounded-xl border-l-4 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col p-3 box-border"
               style="border-left-color: ${colors.border};"
          >
            <div class="flex justify-between items-start mb-1">
              <span class="text-xs font-bold uppercase tracking-wider" style="color: ${colors.border}">${d.type}</span>
              ${d.status ? `<span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${statusClass}">${d.status}</span>` : ''}
            </div>
            <div class="font-semibold text-gray-800 text-sm leading-tight line-clamp-2" title="${d.label}">
               <span class="mr-1">${icon}</span> ${d.label}
            </div>
          </div>
        `;
      });

    // 8. Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehavior.current = zoom;

    // Initial Center logic (only on first mount/data load)
    const initialTransform = d3.zoomIdentity
      .translate((dimensions.width - g.graph().width!) / 2, 50)
      .scale(1);
    svg.call(zoom.transform, initialTransform);

  }, [nodes, links, dimensions, onNodeClick]);

  // --- Interaction Effects (React Side) ---
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const isDimmed = !!highlightedNode;

    // Helper: Is Node B neighbor of Node A?
    const isConnected = (sourceId: string, targetId: string) => {
      return links.some(l => 
        (l.source === sourceId && l.target === targetId) || 
        (l.source === targetId && l.target === sourceId)
      );
    };

    // Update Nodes Opacity
    svg.selectAll('.nodes g')
      .transition().duration(200)
      .style('opacity', (d: any) => {
        if (!isDimmed) return 1;
        return d.id === highlightedNode || isConnected(highlightedNode, d.id) ? 1 : 0.2;
      });

    // Update Links Opacity & Color
    svg.selectAll('.edges path')
      .transition().duration(200)
      .style('opacity', (d: any) => {
        if (!isDimmed) return 1;
        return (d.source === highlightedNode || d.target === highlightedNode) ? 1 : 0.1;
      })
      .attr('stroke', (d: any) => {
        if ((d.source === highlightedNode || d.target === highlightedNode)) return '#3b82f6'; // Blue highlight
        return '#9ca3af';
      })
      .attr('stroke-width', (d: any) => {
         return (d.source === highlightedNode || d.target === highlightedNode) ? 3 : 2;
      })
      .attr('marker-end', (d: any) => {
        return (d.source === highlightedNode || d.target === highlightedNode) ? 'url(#arrow-highlighted)' : 'url(#arrow-default)';
      });

  }, [highlightedNode, links]);

  // --- Controls ---
  const handleZoom = (scaleFactor: number) => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehavior.current.scaleBy, scaleFactor);
    }
  };

  const handleFitView = () => {
    if (svgRef.current && zoomBehavior.current) {
       // Logic to calculate fit could be added here, for now resetting to default center
       const gWidth = nodes.length * 100; // rough estimation if graph obj not available
       const transform = d3.zoomIdentity.translate(dimensions.width / 2 - 100, 50).scale(1);
       d3.select(svgRef.current).transition().duration(750).call(zoomBehavior.current.transform, transform);
    }
  };

  return (
    <div className="w-full h-full relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Control Bar */}
      <div className="absolute bottom-6 right-6 flex gap-2">
         <div className="bg-white p-1.5 rounded-lg shadow-md border border-slate-200 flex flex-col gap-1">
            <button onClick={() => handleZoom(1.2)} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition" title="Zoom In">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button onClick={() => handleZoom(0.8)} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition" title="Zoom Out">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
            </button>
            <button onClick={handleFitView} className="p-2 hover:bg-slate-50 text-slate-600 rounded transition border-t border-slate-100 mt-1" title="Fit View">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
         </div>
      </div>
      
      {/* Legend Overlay */}
      <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200 text-xs">
        <h3 className="font-semibold text-slate-400 uppercase tracking-wider mb-2">Node Types</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {['Experiment', 'Paper', 'Method', 'Metric', 'User'].map(type => {
            const colors = getTypeColor(type.toLowerCase());
            return (
              <div key={type} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.border }}></div>
                <span className="text-slate-700">{type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}