import React, { useRef, useState, useEffect, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import './App.css';

export default function App() {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightIds, setHighlightIds] = useState(new Set());
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filterGroup, setFilterGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./graph.json')
      .catch(() => fetch('./sample_graph.json'))
      .then(r => r.json())
      .then(data => { setGraphData(data); setLoading(false); });
  }, []);

  const groups = [...new Set(graphData.nodes.map(n => n.group))].sort();

  const visibleData = {
    nodes: filterGroup ? graphData.nodes.filter(n => n.group === filterGroup) : graphData.nodes,
    links: filterGroup
      ? graphData.links.filter(l => {
          const ids = new Set(graphData.nodes.filter(n => n.group === filterGroup).map(n => n.id));
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          return ids.has(s) && ids.has(t);
        })
      : graphData.links,
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    fgRef.current?.cameraPosition(
      { x: node.x + 40, y: node.y + 20, z: node.z + 40 },
      node, 1200
    );
  }, []);

  const handleSearch = useCallback((matches) => {
    setHighlightIds(new Set(matches.map(n => n.id)));
    if (matches.length) {
      const node = matches[0];
      fgRef.current?.cameraPosition(
        { x: node.x + 50, y: node.y + 30, z: node.z + 50 },
        node, 1500
      );
    }
  }, []);

  const nodeThreeObject = useCallback((node) => {
    const grp = new THREE.Group();
    const dimmed = highlightIds.size > 0 && !highlightIds.has(node.id);
    const highlighted = highlightIds.has(node.id);
    const hovered = hoveredNode?.id === node.id;

    const size = node.role === 'Main' ? (highlighted ? 9 : 5) : (highlighted ? 6 : 3);
    const color = dimmed ? '#1a1a2e' : (hovered ? '#ffffff' : node.color || '#ffffff');
    const opacity = dimmed ? 0.12 : 0.92;

    const geo = new THREE.SphereGeometry(size * 0.65, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
    grp.add(new THREE.Mesh(geo, mat));

    // Outer glow ring for highlighted nodes
    if (highlighted || hovered) {
      const ringGeo = new THREE.SphereGeometry(size * 1.4, 12, 12);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, wireframe: true });
      grp.add(new THREE.Mesh(ringGeo, ringMat));
    }

    const sprite = new SpriteText(node.name);
    sprite.color = dimmed ? '#222' : (node.color || '#fff');
    sprite.textHeight = highlighted ? 5 : 2.5;
    sprite.position.y = size + 4;
    grp.add(sprite);

    return grp;
  }, [highlightIds, hoveredNode]);

  return (
    <div className="app">
      {loading && (
        <div className="loading">
          <div className="loader" />
          <p>Loading the Constellation...</p>
        </div>
      )}

      <div className="top-bar">
        <div className="logo">🌌 os-anime</div>
        <SearchBar nodes={graphData.nodes} onSearch={handleSearch} />
        <div className="stat">{graphData.nodes.length} characters &middot; {graphData.links.length} connections</div>
      </div>

      <div className="filter-bar">
        <button className={`pill ${!filterGroup ? 'active' : ''}`} onClick={() => setFilterGroup(null)}>All</button>
        {groups.map(g => (
          <button
            key={g}
            className={`pill ${filterGroup === g ? 'active' : ''}`}
            style={{ '--pill-color': graphData.nodes.find(n => n.group === g)?.color || '#fff' }}
            onClick={() => setFilterGroup(g === filterGroup ? null : g)}
          >{g}</button>
        ))}
      </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={visibleData}
        backgroundColor="#050508"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        onNodeClick={handleNodeClick}
        onNodeHover={setHoveredNode}
        linkColor={l => `rgba(255,255,255,${Math.min(0.35, (l.value || 0.1) * 0.8)})`}
        linkWidth={l => (l.value || 0.1) * 2.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.003}
        linkDirectionalParticleWidth={1.2}
        cooldownTicks={120}
        onEngineStop={() => fgRef.current?.zoomToFit(400, 120)}
      />

      {selectedNode && (
        <Sidebar node={selectedNode} onClose={() => setSelectedNode(null)} graphData={graphData} />
      )}
    </div>
  );
}
