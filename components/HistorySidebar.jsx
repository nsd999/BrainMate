'use client';

import { useState } from 'react';
import { History, X, Search, Star, Trash2, Clock, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function HistorySidebar({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onToggleFavorite,
  onDeleteHistory,
  loading
}) {
  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.topic?.toLowerCase().includes(search.toLowerCase());
    const matchesFav = filterFav ? !!item.favorite : true;
    return matchesSearch && matchesFav;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-background shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <History className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Explanation History</h3>
            <p className="text-xs text-muted-foreground">{history.length} saved concepts</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="p-3 border-b border-border/60 space-y-2">
        <div className="relative">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved topics..."
            className="h-8 pl-8 text-xs bg-muted/30 rounded-lg"
          />
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filterFav ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterFav(!filterFav)}
            className={cn(
              'h-7 text-[11px] gap-1 rounded-lg',
              filterFav && 'bg-amber-500 text-white hover:bg-amber-600'
            )}
          >
            <Star className={cn('h-3 w-3', filterFav ? 'fill-white' : 'text-amber-500')} />
            Starred Only
          </Button>
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-xs text-muted-foreground">Loading history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            {search || filterFav ? 'No matching explanations found.' : 'No saved explanations yet.'}
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col gap-1 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-purple-500/40 hover:bg-muted/40"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                  className="text-left font-semibold text-xs text-foreground line-clamp-1 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  {item.topic}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleFavorite(item.id, !item.favorite)}
                    className="p-1 text-muted-foreground hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={cn(
                        'h-3.5 w-3.5',
                        item.favorite && 'text-amber-500 fill-amber-500'
                      )}
                    />
                  </button>
                  <button
                    onClick={() => onDeleteHistory(item.id)}
                    className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30 mt-1">
                <span className="uppercase font-semibold text-purple-600 dark:text-purple-400">
                  {item.mode}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
