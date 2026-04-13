"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface HexNode {
  q: number;
  r: number;
  id: string;
  intensity: number; // 0 to 1
}

export default function HexHeatmap() {
  const [nodes, setNodes] = useState<HexNode[]>([]);
  
  // Hex math
  const hexSize = 24;
  const width = 600;
  const height = 300;

  useEffect(() => {
    // Generate a hexagonal grid (Pointy topped)
    const newNodes: HexNode[] = [];
    const radius = 4;
    for (let q = -radius; q <= radius; q++) {
      let r1 = Math.max(-radius, -q - radius);
      let r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        newNodes.push({
          q,
          r,
          id: `${q},${r}`,
          intensity: Math.random()
        });
      }
    }
    setNodes(newNodes);
  }, []);

  const getHexCoords = (q: number, r: number) => {
    const x = hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = hexSize * (3 / 2) * r;
    return { x: x + width / 2, y: y + height / 2 };
  };

  return (
    <div className="w-full flex justify-center items-center py-8">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="hex-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        
        {nodes.map((node, i) => {
          const { x, y } = getHexCoords(node.q, node.r);
          const baseHue = 210 - node.intensity * 210;
          const color = `hsla(${baseHue}, 80%, 60%, ${0.2 + node.intensity * 0.6})`;
          const isHighIntensity = node.intensity > 0.8;
          
          return (
            <motion.polygon
              key={node.id}
              points={getHexPoints(x, y, hexSize - 2)}
              fill={color}
              stroke={isHighIntensity ? "rgba(255,114,114,0.4)" : "rgba(255,255,255,0.05)"}
              strokeWidth={1}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isHighIntensity ? [1, 1.05, 1] : 1, 
                opacity: 1,
                fill: color,
              }}
              transition={{ 
                scale: isHighIntensity ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0.5 },
                delay: i * 0.005, 
              }}
              whileHover={{ scale: 1.2, fill: "rgba(255,255,255,0.4)", zIndex: 10 }}
              style={{ cursor: "pointer", filter: isHighIntensity ? "url(#hex-glow)" : "none" }}
            />
          );
        })}
      </svg>
    </div>
  );
}

function getHexPoints(x: number, y: number, size: number) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    points.push(`${x + size * Math.cos(angle_rad)},${y + size * Math.sin(angle_rad)}`);
  }
  return points.join(" ");
}
