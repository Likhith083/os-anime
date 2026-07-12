import React, { useMemo } from 'react';
import './Sidebar.css';

export default function Sidebar({ node, onClose, graphData }) {
  const related = useMemo(() => {
    const ids = new Set();
    const edgeMap = {};
    graphData.links.forEach(l => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      if (s === node.id) { ids.add(t); edgeMap[t] = l.value; }
      if (t === node.id) { ids.add(s); edgeMap[s] = l.value; }
    });
    return graphData.nodes
      .filter(n => ids.has(n.id))
      .sort((a, b) => (edgeMap[b.id] || 0) - (edgeMap[a.id] || 0))
      .map(n => ({ ...n, similarity: edgeMap[n.id] || 0 }));
  }, [node, graphData]);

  return (
    <div className="sidebar">
      <button className="close" onClick={onClose}>✕</button>
      {node.img && <img src={node.img} alt={node.name} className="char-img" />}
      <h2 style={{ color: node.color || '#fff' }}>{node.name}</h2>
      <div className="badges">
        <span className="badge series" style={{ background: node.color || '#555' }}>{node.group}</span>
        {node.role && <span className="badge role">{node.role}</span>}
      </div>
      {node.favorites > 0 && <p className="fav">❤️ {node.favorites.toLocaleString()} favorites on MAL</p>}
      <p className="bio">{node.bio}</p>

      {related.length > 0 && (
        <div className="related">
          <h3>Most Similar Characters</h3>
          {related.slice(0, 6).map(r => (
            <div key={r.id} className="related-item">
              {r.img && <img src={r.img} alt={r.name} />}
              <div className="related-info">
                <p style={{ color: r.color || '#fff' }}>{r.name}</p>
                <small>{r.group}</small>
              </div>
              <div className="sim-bar-wrap">
                <div className="sim-bar" style={{ width: `${Math.round(r.similarity * 100)}%`, background: r.color || '#fff' }} />
                <span>{Math.round(r.similarity * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
