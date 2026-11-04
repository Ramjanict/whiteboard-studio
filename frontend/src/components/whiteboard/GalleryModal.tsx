'use client';

import React, { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DrawingDocument } from '@/types/whiteboard';
import { api } from '@/services/api';
import { toast } from 'sonner';
import {
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDrawing: (drawing: DrawingDocument) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  onLoadDrawing,
}) => {
  const [drawings, setDrawings] = useState<DrawingDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<'latest' | 'oldest' | 'title'>('latest');
  const [isPending, startTransition] = useTransition();

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      const res = await api.getDrawings({
        category: category === 'all' ? undefined : category,
        search: searchTerm || undefined,
        sort,
        limit: 50,
      });
      setDrawings(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load drawings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDrawings();
    }
  }, [isOpen, category, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrawings();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this drawing?')) return;

    try {
      await api.deleteDrawing(id);
      toast.success('Drawing deleted successfully');
      setDrawings((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete drawing');
    }
  };

  const handleSeedSamples = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/drawings/seed-samples', {
        method: 'POST',
      });
      const data = await res.json();
      toast.success(data.message || 'Sample templates loaded!');
      fetchDrawings();
    } catch (err: any) {
      toast.error('Failed to seed samples');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 rounded-3xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-bold">Cloud Drawings Gallery</DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDrawings}
              disabled={loading}
              className="h-8 gap-1 rounded-lg text-xs"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              <span>Refresh</span>
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Saved drawings stored in Neon PostgreSQL and Cloudinary. Click any drawing to load it into your board.
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or #ID (e.g. 1, 2)..."
              className="pl-9 h-9 rounded-xl text-sm"
            />
          </form>

          <Tabs value={category} onValueChange={setCategory} className="w-full sm:w-auto">
            <TabsList className="h-9 rounded-xl p-1">
              <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
              <TabsTrigger value="shape" className="rounded-lg text-xs">Shapes</TabsTrigger>
              <TabsTrigger value="annotation" className="rounded-lg text-xs">Annotations</TabsTrigger>
              <TabsTrigger value="diagram" className="rounded-lg text-xs">Diagrams</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSort(sort === 'latest' ? 'oldest' : 'latest')}
            className="h-9 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sort === 'latest' ? 'Newest' : 'Oldest'}</span>
          </Button>
        </div>

        {/* Drawings Grid */}
        <div className="flex-1 overflow-y-auto min-h-[340px] pr-1 mt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm">Loading drawings from Neon DB...</p>
            </div>
          ) : drawings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">No drawings found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  You haven&apos;t saved any drawings yet, or no drawings matched your search.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedSamples}
                className="gap-2 rounded-xl text-xs mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample Templates</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
              {drawings.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onLoadDrawing(doc);
                    onClose();
                  }}
                  className="group relative flex flex-col bg-card hover:bg-accent/40 border border-border hover:border-primary/50 transition-all duration-200 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-36 bg-muted/40 border-b border-border flex items-center justify-center overflow-hidden p-2">
                    {doc.imageUrl ? (
                      <img
                        src={doc.imageUrl}
                        alt={doc.title}
                        className="max-h-full max-w-full object-contain rounded-lg transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <Layers className="w-8 h-8 text-muted-foreground/40" />
                    )}

                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-background/90 backdrop-blur-sm rounded-md border border-border shadow-xs">
                        #{doc.shortId}
                      </span>
                      {doc.isSample && (
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20">
                          Template
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7 rounded-lg shadow-sm"
                        onClick={(e) => handleDelete(doc.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                    <div>
                      <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {doc.title || 'Untitled Board'}
                      </h4>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-muted/60 font-medium">
                        {doc.category || 'shape'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
