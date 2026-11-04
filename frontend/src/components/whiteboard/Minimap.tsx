'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WhiteboardElement, CanvasAppState } from '@/types/whiteboard';
import { Map, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MinimapProps {
  elements: WhiteboardElement[];
  appState: CanvasAppState;
}

export const Minimap: React.FC<MinimapProps> = ({ elements, appState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 160;
    const height = 100;
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.fillStyle = appState.theme === 'dark' ? '#1e293b' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    if (elements.length === 0) return;

    // Calculate bounds of elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((el) => {
      const x = el.x;
      const y = el.y;
      const w = el.width || 50;
      const h = el.height || 50;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });

    const padding = 100;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const sceneWidth = Math.max(maxX - minX, 1000);
    const sceneHeight = Math.max(maxY - minY, 800);

    const scaleX = width / sceneWidth;
    const scaleY = height / sceneHeight;
    const scale = Math.min(scaleX, scaleY);

    ctx.save();
    ctx.translate(10, 10);
    ctx.scale(scale, scale);
    ctx.translate(-minX, -minY);

    // Draw elements miniature
    elements.forEach((el) => {
      ctx.fillStyle = el.strokeColor || '#3b82f6';
      ctx.strokeStyle = el.strokeColor || '#3b82f6';
      ctx.lineWidth = 4;

      if (el.type === 'rectangle' || el.type === 'sticky') {
        ctx.fillRect(el.x, el.y, el.width || 40, el.height || 40);
      } else if (el.type === 'circle') {
        const rx = Math.abs(el.width || 40) / 2;
        const ry = Math.abs(el.height || 40) / 2;
        ctx.beginPath();
        ctx.ellipse(el.x + rx, el.y + ry, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.fillRect(el.x, el.y, 20, 20);
      }
    });

    ctx.restore();
  }, [elements, appState, isVisible]);

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-1.5">
      {isVisible && (
        <div className="p-1.5 bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
          <canvas ref={canvasRef} className="rounded-xl block" />
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="h-8 gap-1.5 text-xs rounded-xl bg-background/90 backdrop-blur-md shadow-md"
      >
        <Map className="w-3.5 h-3.5 text-primary" />
        <span>Minimap</span>
        {isVisible ? <EyeOff className="w-3 h-3 text-muted-foreground" /> : <Eye className="w-3 h-3 text-muted-foreground" />}
      </Button>
    </div>
  );
};
