import React, { useState, useCallback } from 'react';
import './SearchBar.css';

export default function SearchBar({ nodes, onSearch }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = useCallback((e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) { onSearch([]); setSuggestions([]); return; }
    const lower = q.toLowerCase();
    const matches = nodes.filter(
      n => n.name.toLowerCase().includes(lower) || n.bio?.toLowerCase().includes(lower)
    );
    onSearch(matches);
    setSuggestions(matches.slice(0, 6));
  }, [nodes, onSearch]);

  const handleSelect = useCallback((node) => {
    setQuery(node.name);
    setSuggestions([]);
    onSearch([node]);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    onSearch([]);
  }, [onSearch]);

  return (
    <div className="searchbar">
      <span className="search-icon">🔍</span>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search a character, trait, or power..."
        onBlur={() => setTimeout(() => setSuggestions([]), 150)}
      />
      {query && <button className="clear" onClick={handleClear}>✕</button>}
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map(n => (
            <li key={n.id} onMouseDown={() => handleSelect(n)}>
              {n.img && <img src={n.img} alt={n.name} />}
              <span style={{ color: n.color }}>{n.name}</span>
              <small>{n.group}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
