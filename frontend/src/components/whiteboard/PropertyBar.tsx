'use client';

import React from 'react';
import { ToolType, WhiteboardElement } from '@/types/whiteboard';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyBarProps {
  activeTool: ToolType;
  selectedElement: WhiteboardElement | null;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
}

const colorPresets = [
  '#000000',
  '#64748b',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

const fillPresets = [
  'transparent',
  '#ffffff',
  '#f8fafc',
  '#fee2e2',
  '#ffedd5',
  '#fef9c3',
  '#dcfce7',
  '#cffafe',
  '#dbeafe',
  '#ede9fe',
];

const strokeWidths = [
  { label: 'S', value: 2 },
  { label: 'M', value: 4 },
  { label: 'L', value: 8 },
  { label: 'XL', value: 12 },
];

const fontSizes = [16, 20, 28, 36, 48];

export const PropertyBar: React.FC<PropertyBarProps> = ({
  activeTool,
  selectedElement,
  strokeColor,
  setStrokeColor,
  fillColor,
  setFillColor,
  strokeWidth,
  setStrokeWidth,
  fontSize,
  setFontSize,
  onDeleteSelected,
  onDuplicateSelected,
}) => {
  const isTextOrSticky =
    activeTool === 'text' ||
    activeTool === 'sticky' ||
    selectedElement?.type === 'text' ||
    selectedElement?.type === 'sticky';

  const isShape =
    activeTool === 'rectangle' ||
    activeTool === 'circle' ||
    activeTool === 'diamond' ||
    activeTool === 'sticky' ||
    selectedElement?.type === 'rectangle' ||
    selectedElement?.type === 'circle' ||
    selectedElement?.type === 'diamond' ||
    selectedElement?.type === 'sticky';

  return (
    <div className="fixed top-20 left-4 z-30 flex flex-col gap-3 p-3 bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-2xl w-52 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <Sliders className="w-3.5 h-3.5" />
        <span>Properties</span>
      </div>

      {/* Stroke Color */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground">Stroke Color</label>
        <div className="grid grid-cols-5 gap-1.5 items-center">
          {colorPresets.map((c) => (
            <button
              key={c}
              onClick={() => setStrokeColor(c)}
              className={cn(
                'w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110',
                strokeColor === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : '',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={strokeColor.startsWith('#') ? strokeColor : '#000000'}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-7 h-7 rounded border cursor-pointer bg-transparent"
          />
          <span className="text-xs font-mono text-muted-foreground">{strokeColor}</span>
        </div>
      </div>

      {/* Fill Color for shapes and notes */}
      {isShape && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
          <label className="text-xs font-medium text-foreground">Fill Color</label>
          <div className="grid grid-cols-5 gap-1.5 items-center">
            {fillPresets.map((c) => (
              <button
                key={c}
                onClick={() => setFillColor(c)}
                className={cn(
                  'w-6 h-6 rounded-md border border-black/10 transition-transform hover:scale-110 flex items-center justify-center text-[10px]',
                  fillColor === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : '',
                )}
                style={{ backgroundColor: c === 'transparent' ? '#ffffff' : c }}
              >
                {c === 'transparent' && '✕'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stroke Width */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
        <label className="text-xs font-medium text-foreground">Stroke Width</label>
        <div className="grid grid-cols-4 gap-1">
          {strokeWidths.map((sw) => (
            <Button
              key={sw.value}
              size="sm"
              variant={strokeWidth === sw.value ? 'default' : 'outline'}
              className="h-7 text-xs font-semibold rounded-md"
              onClick={() => setStrokeWidth(sw.value)}
            >
              {sw.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Font Size for text and sticky note */}
      {isTextOrSticky && (
        <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
          <label className="text-xs font-medium text-foreground">Font Size</label>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {fontSizes.map((fs) => (
              <Button
                key={fs}
                size="sm"
                variant={fontSize === fs ? 'default' : 'outline'}
                className="h-7 px-2 text-xs font-semibold rounded-md flex-1"
                onClick={() => setFontSize(fs)}
              >
                {fs}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Selection Actions if an element is selected */}
      {selectedElement && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-border">
          {onDuplicateSelected && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs gap-1"
              onClick={onDuplicateSelected}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Clone</span>
            </Button>
          )}
          {onDeleteSelected && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 h-8 text-xs gap-1"
              onClick={onDeleteSelected}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
