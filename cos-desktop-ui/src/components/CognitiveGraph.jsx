import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

export default function CognitiveGraph() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] })

  useEffect(() => {
    fetch(`${API}/graph`)
      .then(r => r.json())
      .then(data => setGraph(data))
      .catch(() => {})
  }, [])

  if (graph.nodes.length === 0) {
    return (
      <div className="text-center text-zinc-600 py-8">
        No graph data yet. Start capturing context.
      </div>
    )
  }

  // Simple 2D visualization 
  const WIDTH = 800, HEIGHT = 400
  const nodePositions = {}
  graph.nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / graph.nodes.length
    const r = Math.min(WIDTH, HEIGHT) * 0.35
    nodePositions[n.id] = {
      x: WIDTH / 2 + r * Math.cos(angle),
      y: HEIGHT / 2 + r * Math.sin(angle),
    }
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-200">🕸️ Cognitive Graph</h3>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto bg-zinc-900/50 rounded-xl border border-zinc-800/40">
        {/* Edges */}
        {graph.edges.map((e, i) => {
          const s = nodePositions[e.source]
          const t = nodePositions[e.target]
          if (!s || !t) return null
          return (
            <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
              stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          )
        })}
        {/* Nodes */}
        {graph.nodes.map(n => {
          const pos = nodePositions[n.id]
          if (!pos) return null
          return (
            <g key={n.id}>
              <circle cx={pos.x} cy={pos.y} r="8" fill="#8b5cf6" opacity="0.8" />
              <text x={pos.x} y={pos.y - 14} textAnchor="middle" fill="#a1a1aa" fontSize="8">
                {(n.summary || '').slice(0, 20)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
