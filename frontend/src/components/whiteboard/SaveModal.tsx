'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloudUpload, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setTitle: (t: string) => void;
  category: string;
  setCategory: (c: string) => void;
  description: string;
  setDescription: (d: string) => void;
  previewDataUrl: string;
  onConfirmSave: () => Promise<void>;
  isSaving: boolean;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  title,
  setTitle,
  category,
  setCategory,
  description,
  setDescription,
  previewDataUrl,
  onConfirmSave,
  isSaving,
}) => {
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmSave();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // non-blocking
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CloudUpload className="w-4 h-4" />
              </div>
              <DialogTitle className="text-lg font-bold">Save Drawing to Cloud</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Save your board to Neon PostgreSQL and Cloudinary CDN for instant sharing and future editing.
            </DialogDescription>
          </DialogHeader>

          {/* Preview image */}
          {previewDataUrl && (
            <div className="w-full h-36 rounded-xl border border-border bg-muted/30 p-2 flex items-center justify-center overflow-hidden">
              <img
                src={previewDataUrl}
                alt="Canvas Preview"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Board Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NextJS Architecture Diagram"
              required
              className="h-9 rounded-xl"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="shape">Shapes & Diagrams</option>
              <option value="annotation">Annotations & Notes</option>
              <option value="wireframe">UI Wireframes</option>
              <option value="freehand">Freehand Sketches</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add quick notes or context about this whiteboard..."
              rows={2}
              className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl h-9 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md font-semibold"
            >
              {isSaving ? (
                <>Saving to Cloud...</>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Save to Neon DB</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
