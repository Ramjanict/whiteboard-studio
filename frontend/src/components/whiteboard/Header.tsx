'use client';

import React from 'react';
import {
  CloudUpload,
  FolderOpen,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid,
  Sun,
  Moon,
  FileJson,
  FileImage,
  Sparkles,
  Users,
  HelpCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CanvasAppState } from '@/types/whiteboard';
import { CollaboratorCursor } from '@/hooks/useCollaboration';

interface HeaderProps {
  title: string;
  setTitle: (title: string) => void;
  category: string;
  isDirty: boolean;
  appState: CanvasAppState;
  setAppState: React.Dispatch<React.SetStateAction<CanvasAppState>>;
  collaborators: CollaboratorCursor[];
  isConnected: boolean;
  onSaveCloud: () => void;
  onOpenGallery: () => void;
  onClearCanvas: () => void;
  onExportPNG: () => void;
  onExportSVG: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  setTitle,
  category,
  isDirty,
  appState,
  setAppState,
  collaborators,
  isConnected,
  onSaveCloud,
  onOpenGallery,
  onClearCanvas,
  onExportPNG,
  onExportSVG,
  onExportJSON,
  onImportJSON,
  onOpenShortcuts,
}) => {
  const toggleTheme = () => {
    const next = appState.theme === 'dark' ? 'light' : 'dark';
    setAppState((prev) => ({ ...prev, theme: next }));
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleGrid = () => {
    const modes: CanvasAppState['gridType'][] = ['dots', 'lines', 'none'];
    const currentIdx = modes.indexOf(appState.gridType);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setAppState((prev) => ({ ...prev, gridType: nextMode }));
  };

  const handleZoom = (delta: number) => {
    setAppState((prev) => {
      const newZoom = Math.min(Math.max(0.2, Number((prev.zoom + delta).toFixed(2))), 3);
      return { ...prev, zoom: newZoom };
    });
  };

  const resetZoom = () => {
    setAppState((prev) => ({ ...prev, zoom: 1 }));
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header className="fixed top-0 left-0 right-0 z-30 h-16 px-4 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between">
        {/* Left: Branding & Editable Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tight hidden sm:inline-block">
              Whiteboard <span className="text-primary text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 ml-1">v2.1</span>
            </span>
          </div>

          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Board..."
              className="text-sm font-semibold bg-transparent hover:bg-muted/50 focus:bg-background px-2.5 py-1 rounded-lg border border-transparent focus:border-border outline-none transition-all w-36 sm:w-56"
            />
            {isDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes" />
            )}
          </div>
        </div>

        {/* Right: Actions & Live Collaboration Presence */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Collaborators Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/50 border border-border text-xs font-medium">
            {isConnected ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <Users className="w-3.5 h-3.5 ml-1" />
                <span>{collaborators.length + 1} online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <WifiOff className="w-3 h-3 text-muted-foreground" />
                <span>Offline</span>
              </span>
            )}
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center bg-muted/60 rounded-xl p-0.5 border border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleZoom(-0.1)}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <button
              onClick={resetZoom}
              className="text-xs font-mono font-medium px-2 py-0.5 text-muted-foreground hover:text-foreground"
            >
              {Math.round(appState.zoom * 100)}%
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleZoom(0.1)}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </div>

          {/* Grid Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl hidden sm:flex" onClick={toggleGrid}>
                <Grid className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Grid: {appState.gridType}</TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={toggleTheme}>
                {appState.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Theme</TooltipContent>
          </Tooltip>

          {/* Shortcuts Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={onOpenShortcuts}>
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Shortcuts (?)</TooltipContent>
          </Tooltip>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl font-medium">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onExportPNG} className="gap-2 cursor-pointer">
                <FileImage className="w-4 h-4 text-blue-500" />
                <span>Export as PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportSVG} className="gap-2 cursor-pointer">
                <FileImage className="w-4 h-4 text-emerald-500" />
                <span>Export as SVG</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportJSON} className="gap-2 cursor-pointer">
                <FileJson className="w-4 h-4 text-purple-500" />
                <span>Export Project (JSON)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImportJSON} className="gap-2 cursor-pointer">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>Import Project (JSON)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cloud Gallery */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenGallery}
            className="h-9 gap-1.5 rounded-xl font-medium text-foreground"
          >
            <FolderOpen className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Gallery</span>
          </Button>

          {/* Clear canvas */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearCanvas}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear Canvas</TooltipContent>
          </Tooltip>

          {/* Save to Cloud Button */}
          <Button
            size="sm"
            onClick={onSaveCloud}
            className="h-9 gap-2 rounded-xl font-semibold shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Save</span>
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
};
