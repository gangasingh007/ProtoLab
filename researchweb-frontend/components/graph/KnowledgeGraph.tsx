'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

// --- Types ---
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'experiment' | 'paper' | 'method' | 'metric' | 'user';
  size: number;
  color: string;
  description?: string; // Added for tooltip
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  label?: string;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
}

// --- Helper for Colors ---
const getNodeColor = (type: string) => {
  switch (type) {
    case 'experiment': return '#22c55e'; // green
    case 'paper': return '#06b6d4'; // cyan
    case 'method': return '#f59e0b'; // amber
    case 'metric': return '#a855f7'; // purple
    case 'user': return '#ec4899'; // pink
    default: return '#9ca3af'; // gray
  }
};

export default function KnowledgeGraph({ nodes, links, onNodeClick }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Tooltip State
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: GraphNode | null }>({
    x: 0,
    y: 0,
    content: null,
  });

  // Zoom State handler to expose to buttons
  const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // --- Resize Observer ---
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Graph Logic ---
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // 1. Setup
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear canvas
    
    const { width, height } = dimensions;

    // 2. Data Preparation (Cloning to avoid React StrictMode mutation issues)
    const nodesData = nodes.map(d => ({ ...d }));
    const linksData = links.map(d => ({ ...d }));

    // 3. Create Adjacency Map for fast lookup (Highlighting logic)
    const linkedByIndex: Record<string, boolean> = {};
    linksData.forEach(d => {
      const s = typeof d.source === 'object' ? (d.source as any).id : d.source;
      const t = typeof d.target === 'object' ? (d.target as any).id : d.target;
      linkedByIndex[`${s},${t}`] = true;
    });

    const isConnected = (a: any, b: any) => {
      return linkedByIndex[`${a.id},${b.id}`] || linkedByIndex[`${b.id},${a.id}`] || a.id === b.id;
    };

    // 4. Container Group
    const g = svg.append('g');

    // 5. Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => g.attr('transform', event.transform));
    
    svg.call(zoom);
    zoomBehavior.current = zoom; // Save for external buttons

    // 6. Simulation
    const simulation = d3.forceSimulation(nodesData)
      .force('link', d3.forceLink(linksData).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.size + 15).iterations(2));

    // 7. Arrow Markers
    const markerTypes = ['reference', 'uses', 'measures', 'authored', 'default'];
    svg.append('defs').selectAll('marker')
      .data(markerTypes)
      .join('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22) // Adjusted for node radius
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#9ca3af');

    // 8. Links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksData)
      .join('line')
      .attr('stroke', '#9ca3af')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', (d: any) => `url(#arrow-${d.type || 'default'})`);

    // 9. Nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodesData)
      .join('circle')
      .attr('r', (d: any) => d.size)
      .attr('fill', (d: any) => d.color || getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', (d) => d.id === selectedNodeId ? 3 : 2)
      .attr('stroke-opacity', (d) => d.id === selectedNodeId ? 1 : 0.8)
      .style('cursor', 'pointer')
      // @ts-ignore
      .call(drag(simulation) as any);

    // 10. Labels
    const label = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodesData)
      .join('text')
      .attr('dx', (d: any) => d.size + 8)
      .attr('dy', 4)
      .text((d: any) => d.label)
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .style('pointer-events', 'none')
      .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8)'); // Readability

    // --- Interactions ---

    // Click
    node.on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNodeId(d.id);
      if (onNodeClick) onNodeClick(d);
      
      // Update visual selection state
      node.attr('stroke', n => n.id === d.id ? '#000' : '#fff')
          .attr('stroke-width', n => n.id === d.id ? 3 : 2);
    });

    // Hover (Highlight Neighbors + Tooltip)
    node.on('mouseover', (event, d) => {
      // Tooltip
      const containerRect = containerRef.current?.getBoundingClientRect();
      const x = event.pageX - (containerRect?.left || 0);
      const y = event.pageY - (containerRect?.top || 0);
      setTooltip({ x, y, content: d });

      // Highlight logic
      node.transition().duration(200)
        .style('opacity', o => isConnected(d, o) ? 1 : 0.1);
      
      link.transition().duration(200)
        .style('opacity', l => (l.source === d || l.target === d) ? 1 : 0.1)
        .attr('stroke', l => (l.source === d || l.target === d) ? '#4b5563' : '#9ca3af');
      
      label.transition().duration(200)
        .style('opacity', o => isConnected(d, o) ? 1 : 0.1);
    })
    .on('mouseout', () => {
      setTooltip({ x: 0, y: 0, content: null });

      // Reset style
      node.transition().duration(200).style('opacity', 1);
      link.transition().duration(200).style('opacity', 0.6).attr('stroke', '#9ca3af');
      label.transition().duration(200).style('opacity', 1);
    });

    // Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, dimensions, selectedNodeId, onNodeClick]);

  // --- Controls Handlers ---
  const handleZoom = (factor: number) => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current)
        .transition().duration(300)
        .call(zoomBehavior.current.scaleBy, factor);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehavior.current) {
      d3.select(svgRef.current)
        .transition().duration(750)
        .call(zoomBehavior.current.transform, d3.zoomIdentity);
    }
  };

  // Drag Helper
  const drag = (simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) => {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={() => setSelectedNodeId(null)} // Deselect on background click
      />

      {/* Floating Tooltip */}
      {tooltip.content && (
        <div 
          className="absolute z-10 pointer-events-none bg-white p-3 rounded-lg shadow-xl border border-slate-100 max-w-xs transition-all duration-75 ease-out"
          style={{ 
            left: tooltip.x + 15, 
            top: tooltip.y - 15,
            opacity: tooltip.content ? 1 : 0
          }}
        >
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tooltip.content.color || getNodeColor(tooltip.content.type) }} />
             <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{tooltip.content.type}</span>
          </div>
          <div className="font-semibold text-slate-800 mb-1">{tooltip.content.label}</div>
          {tooltip.content.description && (
             <p className="text-xs text-slate-500 leading-relaxed">{tooltip.content.description}</p>
          )}
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-md border border-slate-100">
        <button onClick={() => handleZoom(1.2)} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Zoom In">
            <span className="text-lg font-bold">+</span>
        </button>
        <button onClick={() => handleZoom(0.8)} className="p-2 hover:bg-slate-100 rounded text-slate-600" title="Zoom Out">
             <span className="text-lg font-bold">−</span>
        </button>
        <button onClick={handleResetZoom} className="p-2 hover:bg-slate-100 rounded text-slate-600 text-xs font-medium" title="Reset View">
            Fit
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-100">
        <h4 className="font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">Graph Legend</h4>
        <div className="space-y-2 text-xs">
          {['experiment', 'paper', 'method', 'metric', 'user'].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: getNodeColor(type) }}></div>
              <span className="capitalize text-slate-700">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}