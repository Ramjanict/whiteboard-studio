'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ToolType,
  WhiteboardElement,
  CanvasAppState,
  DrawingDocument,
} from '@/types/whiteboard';
import { Header } from '@/components/whiteboard/Header';
import { Toolbar } from '@/components/whiteboard/Toolbar';
import { PropertyBar } from '@/components/whiteboard/PropertyBar';
import { WhiteboardCanvas } from '@/components/whiteboard/WhiteboardCanvas';
import { GalleryModal } from '@/components/whiteboard/GalleryModal';
import { SaveModal } from '@/components/whiteboard/SaveModal';
import { ShortcutsModal } from '@/components/whiteboard/ShortcutsModal';
import { CollaboratorCursors } from '@/components/whiteboard/CollaboratorCursors';
import { Minimap } from '@/components/whiteboard/Minimap';
import { useCollaboration } from '@/hooks/useCollaboration';
import { api } from '@/services/api';
import { toast } from 'sonner';

export default function WhiteboardPage() {
  // Whiteboard document state
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('My Whiteboard');
  const [category, setCategory] = useState<string>('shape');
  const [description, setDescription] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Canvas elements & history
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [history, setHistory] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  // Tool & properties
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>('#3b82f6');
  const [fillColor, setFillColor] = useState<string>('transparent');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(20);

  // Canvas View & Theme State
  const [appState, setAppState] = useState<CanvasAppState>({
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
    gridType: 'dots',
    backgroundColor: '#ffffff',
    theme: 'light',
  });

  // Modal dialog states
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Hidden file input for JSON import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real-time Collaboration Hook
  const handleRemoteElementUpdate = useCallback(
    (remoteElement: WhiteboardElement, action: 'create' | 'update' | 'delete') => {
      if (action === 'delete') {
        setElements((prev) => prev.filter((el) => el.id !== remoteElement.id));
      } else if (action === 'update') {
        setElements((prev) =>
          prev.map((el) => (el.id === remoteElement.id ? remoteElement : el)),
        );
      } else {
        setElements((prev) => {
          if (prev.some((el) => el.id === remoteElement.id)) return prev;
          return [...prev, remoteElement];
        });
      }
    },
    [],
  );

  const handleRemoteCanvasClear = useCallback(() => {
    setElements([]);
    toast.info('Canvas cleared by collaborator');
  }, []);

  const {
    collaborators,
    isConnected,
    currentUser,
    broadcastCursor,
    broadcastElement,
    broadcastClear,
  } = useCollaboration(
    drawingId || 'global',
    handleRemoteElementUpdate,
    handleRemoteCanvasClear,
  );

  // Commit action for undo history
  const handleCommitAction = useCallback(() => {
    setHistory((prev) => [...prev, elements]);
    setRedoStack([]);
    setIsDirty(true);
  }, [elements]);

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [elements, ...prev]);
    setElements(previous);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setSelectedElementId(null);
  }, [history, elements]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, elements]);
    setElements(next);
    setRedoStack((prev) => prev.slice(1));
    setSelectedElementId(null);
  }, [redoStack, elements]);

  // Delete selected element
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElementId) return;
    const target = elements.find((el) => el.id === selectedElementId);
    if (target) {
      broadcastElement(target, 'delete');
    }
    handleCommitAction();
    setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  }, [selectedElementId, elements, broadcastElement, handleCommitAction]);

  // Duplicate selected element
  const handleDuplicateSelected = useCallback(() => {
    if (!selectedElementId) return;
    const target = elements.find((el) => el.id === selectedElementId);
    if (!target) return;
    handleCommitAction();

    const clone: WhiteboardElement = {
      ...target,
      id: `el-${Date.now()}`,
      x: target.x + 20,
      y: target.y + 20,
      startX: target.startX !== undefined ? target.startX + 20 : undefined,
      startY: target.startY !== undefined ? target.startY + 20 : undefined,
      endX: target.endX !== undefined ? target.endX + 20 : undefined,
      endY: target.endY !== undefined ? target.endY + 20 : undefined,
      points: target.points?.map((pt) => ({ x: pt.x + 20, y: pt.y + 20 })),
    };

    setElements((prev) => [...prev, clone]);
    setSelectedElementId(clone.id);
    broadcastElement(clone, 'create');
  }, [selectedElementId, elements, broadcastElement, handleCommitAction]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (elements.length === 0) return;
    if (confirm('Clear the entire whiteboard?')) {
      handleCommitAction();
      setElements([]);
      setSelectedElementId(null);
      broadcastClear();
      toast.info('Canvas cleared');
    }
  }, [elements, broadcastClear, handleCommitAction]);

  // Capture canvas image data URL for export or preview
  const generateCanvasDataUrl = useCallback((): string => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return '';

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return '';

    exportCtx.fillStyle = appState.backgroundColor || '#ffffff';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(canvas, 0, 0);

    return exportCanvas.toDataURL('image/png');
  }, [appState.backgroundColor]);

  // Open Save Modal
  const handleOpenSaveModal = () => {
    const url = generateCanvasDataUrl();
    setPreviewDataUrl(url);
    setIsSaveModalOpen(true);
  };

  // Confirm Save to Neon PostgreSQL & Cloudinary
  const handleConfirmSave = async () => {
    try {
      setIsSaving(true);
      const imageUrl = generateCanvasDataUrl();

      if (drawingId) {
        await api.updateDrawing(drawingId, {
          title,
          category,
          description,
          imageUrl,
          elements,
          appState,
        });
        toast.success('Drawing updated successfully in Neon DB!');
        setIsDirty(false);
      } else {
        const res = await api.createDrawing({
          title,
          category,
          description,
          imageUrl,
          elements,
          appState,
        });
        if (res.data?.id) {
          setDrawingId(res.data.id);
        }
        toast.success('Drawing saved to Neon PostgreSQL & Cloudinary!');
        setIsDirty(false);
      }
      setIsSaveModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save drawing');
    } finally {
      setIsSaving(false);
    }
  };

  // Load drawing from gallery
  const handleLoadDrawing = (drawing: DrawingDocument) => {
    setDrawingId(drawing.id);
    setTitle(drawing.title || 'Untitled Board');
    setCategory(drawing.category || 'shape');
    setDescription(drawing.description || '');

    if (drawing.elements && Array.isArray(drawing.elements)) {
      setElements(drawing.elements);
    } else {
      setElements([]);
    }

    if (drawing.appState) {
      setAppState((prev) => ({
        ...prev,
        ...drawing.appState,
      }));
    }

    setHistory([]);
    setRedoStack([]);
    setSelectedElementId(null);
    setIsDirty(false);
    toast.success(`Loaded "${drawing.title || 'Board'}" into workspace`);
  };

  // Export as PNG
  const handleExportPNG = () => {
    const dataUrl = generateCanvasDataUrl();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'whiteboard'}.png`;
    a.click();
    toast.success('Downloaded PNG image');
  };

  // Export as SVG
  const handleExportSVG = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
    svgContent += `  <rect width="100%" height="100%" fill="${appState.backgroundColor || '#ffffff'}"/>\n`;

    elements.forEach((el) => {
      const stroke = el.strokeColor || '#000000';
      const strokeWidth = el.strokeWidth || 2;
      const fill = el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : 'none';

      if (el.type === 'rectangle') {
        svgContent += `  <rect x="${el.x}" y="${el.y}" width="${el.width || 0}" height="${el.height || 0}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>\n`;
      } else if (el.type === 'circle') {
        const rx = Math.abs(el.width || 0) / 2;
        const ry = Math.abs(el.height || 0) / 2;
        const cx = el.x + (el.width || 0) / 2;
        const cy = el.y + (el.height || 0) / 2;
        svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}"/>\n`;
      } else if (el.type === 'line') {
        svgContent += `  <line x1="${el.startX ?? el.x}" y1="${el.startY ?? el.y}" x2="${el.endX ?? el.x}" y2="${el.endY ?? el.y}" stroke="${stroke}" stroke-width="${strokeWidth}"/>\n`;
      } else if (el.type === 'text') {
        svgContent += `  <text x="${el.x}" y="${el.y + (el.fontSize || 20)}" fill="${stroke}" font-size="${el.fontSize || 20}" font-family="sans-serif">${el.text || ''}</text>\n`;
      }
    });

    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'whiteboard'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded SVG file');
  };

  // Export as JSON project
  const handleExportJSON = () => {
    const project = {
      version: 2,
      title,
      category,
      elements,
      appState,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-') || 'whiteboard'}.whiteboard.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project JSON exported');
  };

  // Import JSON project
  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.elements && Array.isArray(json.elements)) {
          setElements(json.elements);
          if (json.title) setTitle(json.title);
          if (json.category) setCategory(json.category);
          if (json.appState) {
            setAppState((prev) => ({ ...prev, ...json.appState }));
          }
          setHistory([]);
          setRedoStack([]);
          setIsDirty(true);
          toast.success('Project imported successfully');
        } else {
          toast.error('Invalid whiteboard project format');
        }
      } catch {
        toast.error('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Help Modal: ?
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Save: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleOpenSaveModal();
        return;
      }

      // Delete: Backspace or Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
        return;
      }

      // Tool Hotkeys
      switch (e.key.toLowerCase()) {
        case 'h':
          setActiveTool('hand');
          break;
        case 'v':
          setActiveTool('select');
          break;
        case 'p':
          setActiveTool('pencil');
          break;
        case 'r':
          setActiveTool('rectangle');
          break;
        case 'c':
          setActiveTool('circle');
          break;
        case 'd':
          setActiveTool('diamond');
          break;
        case 'a':
          setActiveTool('arrow');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 't':
          setActiveTool('text');
          break;
        case 's':
          setActiveTool('sticky');
          break;
        case 'e':
          setActiveTool('eraser');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleDeleteSelected]);

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-background text-foreground">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Top Header Navbar */}
      <Header
        title={title}
        setTitle={setTitle}
        category={category}
        isDirty={isDirty}
        appState={appState}
        setAppState={setAppState}
        collaborators={collaborators}
        isConnected={isConnected}
        onSaveCloud={handleOpenSaveModal}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onClearCanvas={handleClearCanvas}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Floating Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Properties Inspector Panel */}
      <PropertyBar
        activeTool={activeTool}
        selectedElement={selectedElement}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onDeleteSelected={selectedElement ? handleDeleteSelected : undefined}
        onDuplicateSelected={selectedElement ? handleDuplicateSelected : undefined}
      />

      {/* Real-Time Collaborator Cursors Overlay */}
      <CollaboratorCursors
        collaborators={collaborators}
        appState={appState}
      />

      {/* Interactive Canvas */}
      <WhiteboardCanvas
        elements={elements}
        setElements={setElements}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={strokeWidth}
        fontSize={fontSize}
        appState={appState}
        setAppState={setAppState}
        selectedElementId={selectedElementId}
        setSelectedElementId={setSelectedElementId}
        onCommitAction={handleCommitAction}
        onCursorMove={broadcastCursor}
      />

      {/* Canvas Radar Minimap */}
      <Minimap elements={elements} appState={appState} />

      {/* Cloud Drawings Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onLoadDrawing={handleLoadDrawing}
      />

      {/* Save Drawing to Cloud Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        description={description}
        setDescription={setDescription}
        previewDataUrl={previewDataUrl}
        onConfirmSave={handleConfirmSave}
        isSaving={isSaving}
      />

      {/* Keyboard Shortcuts Reference Dialog */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </main>
  );
}
