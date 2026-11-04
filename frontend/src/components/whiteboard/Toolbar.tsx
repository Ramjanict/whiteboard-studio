'use client';

import React from 'react';
import {
  Hand,
  MousePointer,
  Pencil,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
  Type,
  StickyNote,
  Eraser,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ToolType } from '@/types/whiteboard';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const tools: { type: ToolType; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { type: 'hand', label: 'Hand (Pan)', icon: <Hand className="w-4 h-4" />, shortcut: 'H' },
  { type: 'select', label: 'Select', icon: <MousePointer className="w-4 h-4" />, shortcut: 'V' },
  { type: 'pencil', label: 'Draw (Pencil)', icon: <Pencil className="w-4 h-4" />, shortcut: 'P' },
  { type: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" />, shortcut: 'R' },
  { type: 'circle', label: 'Circle', icon: <Circle className="w-4 h-4" />, shortcut: 'C' },
  { type: 'diamond', label: 'Diamond', icon: <Diamond className="w-4 h-4" />, shortcut: 'D' },
  { type: 'arrow', label: 'Arrow', icon: <ArrowRight className="w-4 h-4" />, shortcut: 'A' },
  { type: 'line', label: 'Line', icon: <Minus className="w-4 h-4" />, shortcut: 'L' },
  { type: 'text', label: 'Text Annotation', icon: <Type className="w-4 h-4" />, shortcut: 'T' },
  { type: 'sticky', label: 'Sticky Note', icon: <StickyNote className="w-4 h-4" />, shortcut: 'S' },
  { type: 'eraser', label: 'Eraser', icon: <Eraser className="w-4 h-4" />, shortcut: 'E' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-2xl">
        <div className="flex items-center gap-1">
          {tools.map((t) => {
            const isActive = activeTool === t.type;
            return (
              <Tooltip key={t.type}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="icon"
                    className={cn(
                      'w-9 h-9 rounded-xl transition-all duration-150',
                      isActive ? 'shadow-sm font-bold scale-105' : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setActiveTool(t.type)}
                  >
                    {t.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="flex items-center gap-1.5">
                  <span>{t.label}</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground rounded">
                    {t.shortcut}
                  </kbd>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="w-[1px] h-6 bg-border mx-1" />

        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canUndo}
                onClick={onUndo}
                className="w-9 h-9 rounded-xl"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!canRedo}
                onClick={onRedo}
                className="w-9 h-9 rounded-xl"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
