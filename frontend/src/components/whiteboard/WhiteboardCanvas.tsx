'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ToolType,
  WhiteboardElement,
  CanvasAppState,
  Point,
} from '@/types/whiteboard';

interface WhiteboardCanvasProps {
  elements: WhiteboardElement[];
  setElements: React.Dispatch<React.SetStateAction<WhiteboardElement[]>>;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  appState: CanvasAppState;
  setAppState: React.Dispatch<React.SetStateAction<CanvasAppState>>;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  onCommitAction: () => void;
  onCursorMove?: (x: number, y: number) => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  elements,
  setElements,
  activeTool,
  setActiveTool,
  strokeColor,
  fillColor,
  strokeWidth,
  fontSize,
  appState,
  setAppState,
  selectedElementId,
  setSelectedElementId,
  onCommitAction,
  onCursorMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Inline text editing state
  const [editingTextElement, setEditingTextElement] = useState<{
    id: string;
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Convert screen coordinates to canvas space (accounting for zoom and scroll)
  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      return {
        x: (clientX - appState.scrollX) / appState.zoom,
        y: (clientY - appState.scrollY) / appState.zoom,
      };
    },
    [appState.scrollX, appState.scrollY, appState.zoom],
  );

  // Check if point hits an element
  const getElementAtPosition = useCallback(
    (point: Point): WhiteboardElement | null => {
      // iterate in reverse order so top-most element gets selected first
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (el.type === 'rectangle' || el.type === 'sticky') {
          const w = el.width || 0;
          const h = el.height || 0;
          const minX = Math.min(el.x, el.x + w);
          const maxX = Math.max(el.x, el.x + w);
          const minY = Math.min(el.y, el.y + h);
          const maxY = Math.max(el.y, el.y + h);
          if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
            return el;
          }
        } else if (el.type === 'circle') {
          const rx = Math.abs(el.width || 0) / 2;
          const ry = Math.abs(el.height || 0) / 2;
          const cx = el.x + (el.width || 0) / 2;
          const cy = el.y + (el.height || 0) / 2;
          if (rx > 0 && ry > 0) {
            const normalized =
              Math.pow(point.x - cx, 2) / Math.pow(rx, 2) +
              Math.pow(point.y - cy, 2) / Math.pow(ry, 2);
            if (normalized <= 1) return el;
          }
        } else if (el.type === 'text') {
          const w = el.width || 120;
          const h = el.height || 40;
          if (point.x >= el.x && point.x <= el.x + w && point.y >= el.y && point.y <= el.y + h) {
            return el;
          }
        } else if (el.type === 'diamond') {
          const w = el.width || 0;
          const h = el.height || 0;
          const minX = Math.min(el.x, el.x + w);
          const maxX = Math.max(el.x, el.x + w);
          const minY = Math.min(el.y, el.y + h);
          const maxY = Math.max(el.y, el.y + h);
          if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
            return el;
          }
        } else if (el.type === 'line' || el.type === 'arrow') {
          const sx = el.startX ?? el.x;
          const sy = el.startY ?? el.y;
          const ex = el.endX ?? el.x;
          const ey = el.endY ?? el.y;
          const dist = distanceToSegment(point, { x: sx, y: sy }, { x: ex, y: ey });
          if (dist <= (el.strokeWidth || 4) + 6) return el;
        } else if (el.type === 'pencil' && el.points) {
          for (let p = 0; p < el.points.length - 1; p++) {
            const p1 = el.points[p];
            const p2 = el.points[p + 1];
            if (distanceToSegment(point, p1, p2) <= (el.strokeWidth || 4) + 6) {
              return el;
            }
          }
        }
      }
      return null;
    },
    [elements],
  );

  // Helper: Distance from point to line segment
  function distanceToSegment(p: Point, v: Point, w: Point) {
    const l2 = Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (editingTextElement) {
      setEditingTextElement(null);
    }

    const pos = getCanvasCoordinates(e);
    if (onCursorMove) {
      onCursorMove(pos.x, pos.y);
    }

    // Pan canvas with middle mouse or hand tool
    if (e.button === 1 || activeTool === 'hand' || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - appState.scrollX, y: e.clientY - appState.scrollY });
      return;
    }

    // Eraser Tool
    if (activeTool === 'eraser') {
      const hit = getElementAtPosition(pos);
      if (hit) {
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
        if (selectedElementId === hit.id) setSelectedElementId(null);
        onCommitAction();
      }
      setIsDrawing(true);
      return;
    }

    // Select Tool
    if (activeTool === 'select') {
      const hit = getElementAtPosition(pos);
      if (hit) {
        setSelectedElementId(hit.id);
        setDraggedElementId(hit.id);
        setDragOffset({ x: pos.x - hit.x, y: pos.y - hit.y });
      } else {
        setSelectedElementId(null);
      }
      return;
    }

    // Text tool
    if (activeTool === 'text') {
      const newId = `text-${Date.now()}`;
      const newTextElement: WhiteboardElement = {
        id: newId,
        type: 'text',
        x: pos.x,
        y: pos.y,
        width: 150,
        height: 40,
        strokeColor,
        strokeWidth: 1,
        fontSize,
        text: 'Type text here...',
      };
      setElements((prev) => [...prev, newTextElement]);
      setSelectedElementId(newId);
      setEditingTextElement({
        id: newId,
        text: '',
        x: pos.x * appState.zoom + appState.scrollX,
        y: pos.y * appState.zoom + appState.scrollY,
      });
      onCommitAction();
      setActiveTool('select');
      return;
    }

    // Shape / Drawing Tools
    setIsDrawing(true);
    const id = `el-${Date.now()}`;

    let newElement: WhiteboardElement = {
      id,
      type: activeTool,
      x: pos.x,
      y: pos.y,
      strokeColor,
      fillColor,
      strokeWidth,
      fontSize,
    };

    if (activeTool === 'pencil') {
      newElement.points = [{ x: pos.x, y: pos.y }];
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      newElement.startX = pos.x;
      newElement.startY = pos.y;
      newElement.endX = pos.x;
      newElement.endY = pos.y;
    } else if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond') {
      newElement.width = 0;
      newElement.height = 0;
    } else if (activeTool === 'sticky') {
      newElement.width = 160;
      newElement.height = 160;
      newElement.fillColor = fillColor === 'transparent' ? '#fef08a' : fillColor;
      newElement.text = 'Note...';
    }

    setCurrentElement(newElement);
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setAppState((prev) => ({
        ...prev,
        scrollX: e.clientX - panStart.x,
        scrollY: e.clientY - panStart.y,
      }));
      return;
    }

    const pos = getCanvasCoordinates(e);
    if (onCursorMove) {
      onCursorMove(pos.x, pos.y);
    }

    // Eraser drag
    if (activeTool === 'eraser' && isDrawing) {
      const hit = getElementAtPosition(pos);
      if (hit) {
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
      }
      return;
    }

    // Moving element in select mode
    if (activeTool === 'select' && draggedElementId) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== draggedElementId) return el;
          const dx = pos.x - dragOffset.x - el.x;
          const dy = pos.y - dragOffset.y - el.y;

          if (el.type === 'pencil' && el.points) {
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
              points: el.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })),
            };
          }
          if (el.type === 'line' || el.type === 'arrow') {
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
              startX: (el.startX ?? el.x) + dx,
              startY: (el.startY ?? el.y) + dy,
              endX: (el.endX ?? el.x) + dx,
              endY: (el.endY ?? el.y) + dy,
            };
          }

          return {
            ...el,
            x: pos.x - dragOffset.x,
            y: pos.y - dragOffset.y,
          };
        }),
      );
      return;
    }

    // Creating shape / drawing
    if (!isDrawing || !currentElement) return;

    if (currentElement.type === 'pencil') {
      const newPoints = [...(currentElement.points || []), pos];
      setCurrentElement({ ...currentElement, points: newPoints });
    } else if (currentElement.type === 'line' || currentElement.type === 'arrow') {
      setCurrentElement({ ...currentElement, endX: pos.x, endY: pos.y });
    } else if (
      currentElement.type === 'rectangle' ||
      currentElement.type === 'circle' ||
      currentElement.type === 'diamond' ||
      currentElement.type === 'sticky'
    ) {
      const width = pos.x - currentElement.x;
      const height = pos.y - currentElement.y;
      setCurrentElement({ ...currentElement, width, height });
    }
  };

  // Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (activeTool === 'select' && draggedElementId) {
      setDraggedElementId(null);
      onCommitAction();
      return;
    }

    if (isDrawing && currentElement) {
      // Normalize negative width/height for boxes
      let finalElement = { ...currentElement };
      if (
        (finalElement.type === 'rectangle' ||
          finalElement.type === 'circle' ||
          finalElement.type === 'diamond' ||
          finalElement.type === 'sticky') &&
        finalElement.width !== undefined &&
        finalElement.height !== undefined
      ) {
        if (Math.abs(finalElement.width) < 5 && Math.abs(finalElement.height) < 5) {
          // Ignore accidental tiny clicks
          setIsDrawing(false);
          setCurrentElement(null);
          return;
        }
        if (finalElement.width < 0) {
          finalElement.x += finalElement.width;
          finalElement.width = Math.abs(finalElement.width);
        }
        if (finalElement.height < 0) {
          finalElement.y += finalElement.height;
          finalElement.height = Math.abs(finalElement.height);
        }
      }

      setElements((prev) => [...prev, finalElement]);
      setSelectedElementId(finalElement.id);
      setCurrentElement(null);
      setIsDrawing(false);
      onCommitAction();
    }
  };

  // Wheel zoom & pan
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom centered on cursor
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(Math.max(0.2, appState.zoom * zoomFactor), 3);

      const newScrollX = mouseX - (mouseX - appState.scrollX) * (newZoom / appState.zoom);
      const newScrollY = mouseY - (mouseY - appState.scrollY) * (newZoom / appState.zoom);

      setAppState((prev) => ({
        ...prev,
        zoom: Number(newZoom.toFixed(2)),
        scrollX: Math.round(newScrollX),
        scrollY: Math.round(newScrollY),
      }));
    } else {
      // Pan
      setAppState((prev) => ({
        ...prev,
        scrollX: prev.scrollX - e.deltaX,
        scrollY: prev.scrollY - e.deltaY,
      }));
    }
  };

  // Double click on sticky or text to edit
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoordinates(e);
    if (onCursorMove) {
      onCursorMove(pos.x, pos.y);
    }
    const hit = getElementAtPosition(pos);
    if (hit && (hit.type === 'text' || hit.type === 'sticky')) {
      setSelectedElementId(hit.id);
      setEditingTextElement({
        id: hit.id,
        text: hit.text || '',
        x: hit.x * appState.zoom + appState.scrollX,
        y: hit.y * appState.zoom + appState.scrollY,
      });
    }
  };

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Canvas Background
    if (appState.backgroundColor) {
      ctx.fillStyle = appState.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Apply Zoom & Pan
    ctx.translate(appState.scrollX, appState.scrollY);
    ctx.scale(appState.zoom, appState.zoom);

    // Helper: draw single element
    const renderElement = (el: WhiteboardElement) => {
      ctx.save();
      ctx.strokeStyle = el.strokeColor || '#000000';
      ctx.lineWidth = el.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (el.opacity) ctx.globalAlpha = el.opacity;

      const fill = el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : null;

      switch (el.type) {
        case 'pencil':
          if (el.points && el.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(el.points[0].x, el.points[0].y);
            for (let i = 1; i < el.points.length; i++) {
              ctx.lineTo(el.points[i].x, el.points[i].y);
            }
            ctx.stroke();
          }
          break;

        case 'line': {
          const sx = el.startX ?? el.x;
          const sy = el.startY ?? el.y;
          const ex = el.endX ?? el.x;
          const ey = el.endY ?? el.y;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          break;
        }

        case 'arrow': {
          const sx = el.startX ?? el.x;
          const sy = el.startY ?? el.y;
          const ex = el.endX ?? el.x;
          const ey = el.endY ?? el.y;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          // Arrow head
          const angle = Math.atan2(ey - sy, ex - sx);
          const headLength = 12 + (el.strokeWidth || 3) * 1.5;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(
            ex - headLength * Math.cos(angle - Math.PI / 6),
            ey - headLength * Math.sin(angle - Math.PI / 6),
          );
          ctx.moveTo(ex, ey);
          ctx.lineTo(
            ex - headLength * Math.cos(angle + Math.PI / 6),
            ey - headLength * Math.sin(angle + Math.PI / 6),
          );
          ctx.stroke();
          break;
        }

        case 'rectangle': {
          const w = el.width || 0;
          const h = el.height || 0;
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(el.x, el.y, w, h);
          }
          ctx.strokeRect(el.x, el.y, w, h);

          if (el.text) {
            ctx.fillStyle = el.strokeColor || '#000000';
            ctx.font = `${el.fontSize || 16}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.text, el.x + w / 2, el.y + h / 2);
          }
          break;
        }

        case 'circle': {
          const w = el.width || 0;
          const h = el.height || 0;
          const rx = Math.abs(w) / 2;
          const ry = Math.abs(h) / 2;
          const cx = el.x + w / 2;
          const cy = el.y + h / 2;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
          }
          ctx.stroke();

          if (el.text) {
            ctx.fillStyle = el.strokeColor || '#000000';
            ctx.font = `${el.fontSize || 16}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.text, cx, cy);
          }
          break;
        }

        case 'diamond': {
          const w = el.width || 0;
          const h = el.height || 0;
          const cx = el.x + w / 2;
          const cy = el.y + h / 2;
          ctx.beginPath();
          ctx.moveTo(cx, el.y);
          ctx.lineTo(el.x + w, cy);
          ctx.lineTo(cx, el.y + h);
          ctx.lineTo(el.x, cy);
          ctx.closePath();
          if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
          }
          ctx.stroke();

          if (el.text) {
            ctx.fillStyle = el.strokeColor || '#000000';
            ctx.font = `${el.fontSize || 16}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(el.text, cx, cy);
          }
          break;
        }

        case 'sticky': {
          const w = el.width || 160;
          const h = el.height || 160;
          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.fillRect(el.x + 4, el.y + 4, w, h);

          // Body
          ctx.fillStyle = el.fillColor || '#fef08a';
          ctx.fillRect(el.x, el.y, w, h);

          ctx.strokeStyle = el.strokeColor || '#ca8a04';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(el.x, el.y, w, h);

          // Content
          if (el.text) {
            ctx.fillStyle = '#1e293b';
            ctx.font = `${el.fontSize || 16}px sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            const lines = el.text.split('\n');
            const lineHeight = (el.fontSize || 16) * 1.35;
            lines.forEach((line, idx) => {
              ctx.fillText(line, el.x + 12, el.y + 12 + idx * lineHeight);
            });
          }
          break;
        }

        case 'text': {
          ctx.fillStyle = el.strokeColor || '#000000';
          ctx.font = `${el.fontSize || 24}px sans-serif`;
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          ctx.fillText(el.text || '', el.x, el.y);
          break;
        }
      }

      // Draw selection bounding box if element is selected
      if (el.id === selectedElementId) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);

        let minX = el.x;
        let minY = el.y;
        let w = el.width || 0;
        let h = el.height || 0;

        if (el.type === 'line' || el.type === 'arrow') {
          const sx = el.startX ?? el.x;
          const sy = el.startY ?? el.y;
          const ex = el.endX ?? el.x;
          const ey = el.endY ?? el.y;
          minX = Math.min(sx, ex) - 8;
          minY = Math.min(sy, ey) - 8;
          w = Math.abs(ex - sx) + 16;
          h = Math.abs(ey - sy) + 16;
        } else if (el.type === 'pencil' && el.points) {
          const xs = el.points.map((p) => p.x);
          const ys = el.points.map((p) => p.y);
          minX = Math.min(...xs) - 8;
          minY = Math.min(...ys) - 8;
          w = Math.max(...xs) - minX + 8;
          h = Math.max(...ys) - minY + 8;
        } else {
          minX -= 6;
          minY -= 6;
          w += 12;
          h += 12;
        }

        ctx.strokeRect(minX, minY, w, h);
        ctx.setLineDash([]); // reset

        // Draw handles at corners
        const handles = [
          { x: minX, y: minY },
          { x: minX + w, y: minY },
          { x: minX, y: minY + h },
          { x: minX + w, y: minY + h },
        ];
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        handles.forEach((pt) => {
          ctx.fillRect(pt.x - 4, pt.y - 4, 8, 8);
          ctx.strokeRect(pt.x - 4, pt.y - 4, 8, 8);
        });
      }

      ctx.restore();
    };

    // Render all elements
    elements.forEach(renderElement);

    // Render current active drawing preview
    if (currentElement) {
      renderElement(currentElement);
    }

    ctx.restore();
  }, [elements, currentElement, appState, selectedElementId]);

  // Handle inline text input submission
  const handleTextCommit = (newText: string) => {
    if (!editingTextElement) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === editingTextElement.id ? { ...el, text: newText } : el,
      ),
    );
    setEditingTextElement(null);
    onCommitAction();
  };

  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${
        appState.gridType === 'dots'
          ? 'canvas-dots'
          : appState.gridType === 'lines'
          ? 'canvas-lines'
          : ''
      }`}
      style={{
        cursor:
          activeTool === 'hand' || isPanning
            ? 'grab'
            : activeTool === 'select'
            ? 'default'
            : activeTool === 'eraser'
            ? 'crosshair'
            : 'crosshair',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full block"
      />

      {/* Inline Text Editor for Text Tool & Sticky Notes */}
      {editingTextElement && (
        <textarea
          autoFocus
          className="absolute z-50 p-2 text-sm bg-background border-2 border-primary rounded-lg shadow-xl outline-none resize-both font-sans"
          style={{
            left: `${editingTextElement.x}px`,
            top: `${editingTextElement.y}px`,
            minWidth: '160px',
            minHeight: '80px',
          }}
          value={editingTextElement.text}
          onChange={(e) =>
            setEditingTextElement({
              ...editingTextElement,
              text: e.target.value,
            })
          }
          onBlur={() => handleTextCommit(editingTextElement.text)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleTextCommit(editingTextElement.text);
            }
          }}
        />
      )}
    </div>
  );
};
