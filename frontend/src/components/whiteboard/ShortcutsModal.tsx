'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcutGroups = [
    {
      category: 'Tools',
      shortcuts: [
        { key: 'H', desc: 'Hand tool (Pan Canvas)' },
        { key: 'V', desc: 'Select tool (Move & Edit)' },
        { key: 'P', desc: 'Freehand Pencil' },
        { key: 'R', desc: 'Rectangle tool' },
        { key: 'C', desc: 'Circle / Ellipse tool' },
        { key: 'D', desc: 'Diamond tool' },
        { key: 'A', desc: 'Arrow tool' },
        { key: 'L', desc: 'Line tool' },
        { key: 'T', desc: 'Text Annotation' },
        { key: 'S', desc: 'Sticky Note' },
        { key: 'E', desc: 'Eraser tool' },
      ],
    },
    {
      category: 'Actions & History',
      shortcuts: [
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Y', desc: 'Redo' },
        { key: 'Ctrl + S', desc: 'Save to Cloud (Neon DB)' },
        { key: 'Delete / Backspace', desc: 'Delete Selected Element' },
        { key: 'Space + Drag', desc: 'Quick Pan' },
        { key: 'Ctrl + Wheel', desc: 'Zoom In / Out centered on cursor' },
        { key: '?', desc: 'Open Shortcuts Reference' },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Keyboard className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold">Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Quick reference for high-speed whiteboard navigation and drafting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 gap-1.5 bg-muted/40 p-2.5 rounded-2xl border border-border">
                {group.shortcuts.map((sc) => (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-background/80"
                  >
                    <span className="text-foreground">{sc.desc}</span>
                    <kbd className="px-2 py-0.5 text-[11px] font-mono font-bold bg-background border border-border rounded-md shadow-2xs">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
