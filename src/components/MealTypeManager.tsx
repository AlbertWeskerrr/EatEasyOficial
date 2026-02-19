import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Plus, Trash2, GripVertical, X } from 'lucide-react';
import { MealType } from '@/types';

const MEAL_ICONS = ['☕', '🍽️', '🥗', '💪', '🥤', '🍌', '🥧', '🥣', '🌙', '🌅', '🍎', '🥪'];
const MEAL_COLORS = ['amber', 'green', 'orange', 'purple', 'blue', 'red', 'pink', 'teal'];
const QUICK_SUGGESTIONS = [
  { nome: 'Pré-treino', icone: '💪' },
  { nome: 'Pós-treino', icone: '🥤' },
  { nome: 'Brunch', icone: '🥣' },
  { nome: 'Ceia', icone: '🌙' },
  { nome: 'Lanche da Tarde', icone: '🍎' },
];

interface MealTypeManagerProps {
  mealTypes: MealType[];
  onAdd: (mealType: MealType) => void;
  onUpdate: (id: string, updates: Partial<MealType>) => void;
  onRemove: (id: string) => void;
  onReorder: (types: MealType[]) => void;
}

export function MealTypeManager({ mealTypes, onAdd, onUpdate, onRemove, onReorder }: MealTypeManagerProps) {
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingType, setEditingType] = useState<MealType | null>(null);
  
  // New meal type form
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🍽️');
  const [newColor, setNewColor] = useState('green');
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddNew = () => {
    if (!newName.trim()) return;
    
    const newMealType: MealType = {
      id: `meal-${Date.now()}`,
      nome: newName.trim(),
      icone: newIcon,
      cor: newColor,
      ordem: mealTypes.length + 1,
    };
    
    onAdd(newMealType);
    setNewName('');
    setNewIcon('🍽️');
    setNewColor('green');
    setShowAddDialog(false);
  };

  const handleQuickAdd = (suggestion: typeof QUICK_SUGGESTIONS[0]) => {
    setNewName(suggestion.nome);
    setNewIcon(suggestion.icone);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newTypes = [...mealTypes];
    const [draggedItem] = newTypes.splice(draggedIndex, 1);
    newTypes.splice(index, 0, draggedItem);
    
    // Update ordem
    const reordered = newTypes.map((type, i) => ({ ...type, ordem: i + 1 }));
    onReorder(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const canAddMore = mealTypes.length < 10;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Gerenciar Refeições
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Minhas Refeições</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {mealTypes.sort((a, b) => a.ordem - b.ordem).map((type, index) => (
              <div
                key={type.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-2 p-3 bg-muted/50 rounded-lg cursor-move
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  hover:bg-muted transition-colors
                `}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-xl">{type.icone}</span>
                <span className="flex-1 font-medium">{type.nome}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingType(type)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Deletar "${type.nome}" e seus alimentos?`)) {
                      onRemove(type.id);
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {canAddMore ? (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Nova Refeição
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground mt-4">
              ⚠️ Limite de 10 refeições atingido
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Meal Type Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Refeição</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Pré-treino"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sugestões Rápidas</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((s) => (
                  <Button
                    key={s.nome}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(s)}
                    className={newName === s.nome ? 'border-primary' : ''}
                  >
                    {s.icone} {s.nome}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ícone</label>
              <div className="flex flex-wrap gap-2">
                {MEAL_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className={`
                      w-10 h-10 text-xl rounded-lg transition-all
                      ${newIcon === icon ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted hover:bg-muted/80'}
                    `}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cor</label>
              <Select value={newColor} onValueChange={setNewColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNew} disabled={!newName.trim()}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meal Type Dialog */}
      <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Refeição</DialogTitle>
          </DialogHeader>
          
          {editingType && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome</label>
                <Input
                  value={editingType.nome}
                  onChange={(e) => setEditingType({ ...editingType, nome: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditingType({ ...editingType, icone: icon })}
                      className={`
                        w-10 h-10 text-xl rounded-lg transition-all
                        ${editingType.icone === icon ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted hover:bg-muted/80'}
                      `}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingType(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (editingType) {
                  onUpdate(editingType.id, { nome: editingType.nome, icone: editingType.icone });
                  setEditingType(null);
                }
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
