import { useState, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DietaryRestriction, RESTRICTION_CATEGORIES, RestrictionCategory } from '@/types/restrictions';
import { RestrictionBadge } from './RestrictionBadge';
import { cn } from '@/lib/utils';

interface RestrictionSelectorProps {
  allRestrictions: DietaryRestriction[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function RestrictionSelector({
  allRestrictions,
  selectedIds,
  onSelectionChange,
  disabled = false,
}: RestrictionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<RestrictionCategory | 'all'>('all');

  const selectedRestrictions = useMemo(() => {
    return allRestrictions.filter((r) => selectedIds.includes(r.id));
  }, [allRestrictions, selectedIds]);

  const filteredRestrictions = useMemo(() => {
    let filtered = allRestrictions;

    if (activeTab !== 'all') {
      filtered = filtered.filter((r) => r.category === activeTab);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower) ||
          r.keywords.some((k) => k.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [allRestrictions, activeTab, search]);

  const groupedRestrictions = useMemo(() => {
    const groups: Record<RestrictionCategory, DietaryRestriction[]> = {
      allergy: [],
      intolerance: [],
      health: [],
      dietary: [],
      religious: [],
    };

    filteredRestrictions.forEach((r) => {
      if (groups[r.category as RestrictionCategory]) {
        groups[r.category as RestrictionCategory].push(r);
      }
    });

    return groups;
  }, [filteredRestrictions]);

  const toggleRestriction = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const removeRestriction = (id: string) => {
    onSelectionChange(selectedIds.filter((sid) => sid !== id));
  };

  const categoryOrder: RestrictionCategory[] = ['allergy', 'intolerance', 'health', 'dietary', 'religious'];

  return (
    <div className="space-y-3">
      {/* Selected restrictions display */}
      {selectedRestrictions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRestrictions.map((r) => (
            <div
              key={r.id}
              className={cn(
                'inline-flex items-center gap-1 rounded-full pr-1 border',
                RESTRICTION_CATEGORIES[r.category as RestrictionCategory].bgClass,
                RESTRICTION_CATEGORIES[r.category as RestrictionCategory].textClass,
                RESTRICTION_CATEGORIES[r.category as RestrictionCategory].borderClass
              )}
            >
              <span className="pl-2 py-1 text-sm">
                {r.icon} {r.name}
              </span>
              <button
                type="button"
                onClick={() => removeRestriction(r.id)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selector dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" disabled={disabled}>
            <Search className="h-4 w-4 mr-2" />
            {selectedRestrictions.length === 0
              ? 'Selecionar restrições alimentares'
              : `${selectedRestrictions.length} restrição(ões) selecionada(s)`}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Restrições Alimentares</DialogTitle>
          </DialogHeader>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar restrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RestrictionCategory | 'all')}>
            <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="all" className="text-xs">
                Todas
              </TabsTrigger>
              {categoryOrder.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {RESTRICTION_CATEGORIES[cat].icon} {RESTRICTION_CATEGORIES[cat].label}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              {activeTab === 'all' ? (
                // Show grouped by category
                <div className="space-y-6">
                  {categoryOrder.map((cat) => {
                    const items = groupedRestrictions[cat];
                    if (items.length === 0) return null;

                    return (
                      <div key={cat}>
                        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <span>{RESTRICTION_CATEGORIES[cat].icon}</span>
                          <span className={RESTRICTION_CATEGORIES[cat].textClass}>
                            {RESTRICTION_CATEGORIES[cat].label}
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((r) => (
                            <RestrictionItem
                              key={r.id}
                              restriction={r}
                              isSelected={selectedIds.includes(r.id)}
                              onToggle={() => toggleRestriction(r.id)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Show only selected category
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredRestrictions.map((r) => (
                    <RestrictionItem
                      key={r.id}
                      restriction={r}
                      isSelected={selectedIds.includes(r.id)}
                      onToggle={() => toggleRestriction(r.id)}
                    />
                  ))}
                </div>
              )}

              {filteredRestrictions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma restrição encontrada
                </div>
              )}
            </ScrollArea>
          </Tabs>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selecionada(s)
            </span>
            <Button onClick={() => setOpen(false)}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RestrictionItemProps {
  restriction: DietaryRestriction;
  isSelected: boolean;
  onToggle: () => void;
}

function RestrictionItem({ restriction, isSelected, onToggle }: RestrictionItemProps) {
  const category = RESTRICTION_CATEGORIES[restriction.category as RestrictionCategory];

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
        isSelected
          ? cn(category.bgClass, category.borderClass)
          : 'bg-card hover:bg-muted border-border'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg',
          isSelected ? 'bg-white/50 dark:bg-black/20' : category.bgClass
        )}
      >
        {restriction.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn('font-medium text-sm', isSelected && category.textClass)}>
          {restriction.name}
        </div>
        {restriction.description && (
          <div className="text-xs text-muted-foreground truncate">{restriction.description}</div>
        )}
      </div>
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center',
          isSelected
            ? cn('bg-primary border-primary text-primary-foreground')
            : 'border-muted-foreground/30'
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>
    </button>
  );
}
