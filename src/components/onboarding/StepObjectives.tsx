import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { OnboardingData } from './OnboardingQuestionnaire';
import { cn } from '@/lib/utils';
import { RestrictionSelector } from '@/components/restrictions/RestrictionSelector';
import { useRestrictions } from '@/hooks/useRestrictions';

interface StepObjectivesProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const objectives = [
  { value: 'Perda de Peso', description: 'Emagrecer de forma saudável', emoji: '📉' },
  { value: 'Manutenção', description: 'Manter o peso atual', emoji: '⚖️' },
  { value: 'Ganho de Massa', description: 'Ganhar massa muscular', emoji: '💪' },
];

// Parse comma-separated string into array
function parseToArray(str: string): string[] {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// Convert array back to comma-separated string
function arrayToString(arr: string[]): string {
  return arr.join(', ');
}

interface TagInputProps {
  label: string;
  subLabel?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  variant?: 'default' | 'warning';
}

function TagInput({ label, subLabel, value, onChange, placeholder, variant = 'default' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const tags = parseToArray(value);

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      onChange(arrayToString(newTags));
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(arrayToString(newTags));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const badgeVariant = variant === 'warning' ? 'destructive' : 'secondary';
  const badgeClass = variant === 'warning' 
    ? 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30' 
    : 'bg-primary/20 text-foreground border-0 hover:bg-primary/30';

  return (
    <div className="space-y-3">
      <Label className="text-[hsl(0,0%,12%)] font-medium">
        {label} {subLabel && <span className="text-[hsl(0,0%,60%)] font-normal">{subLabel}</span>}
      </Label>
      
      {/* Tags display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <Badge 
              key={idx} 
              variant={badgeVariant}
              className={cn("px-3 py-1.5 text-sm cursor-pointer transition-colors", badgeClass)}
              onClick={() => removeTag(tag)}
            >
              {variant === 'warning' && '⚠️ '}
              {tag}
              <X className="w-3 h-3 ml-1.5" />
            </Badge>
          ))}
        </div>
      )}
      
      {/* Input to add new tag */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-[hsl(0,0%,83%)] bg-white text-[hsl(0,0%,12%)] placeholder:text-[hsl(0,0%,60%)] focus:border-[hsl(50,100%,50%)] focus:ring-[hsl(50,100%,50%)]"
        />
        <Button
          type="button"
          onClick={addTag}
          disabled={!inputValue.trim()}
          size="icon"
          className="bg-[hsl(50,100%,50%)] hover:bg-[hsl(48,100%,46%)] text-[hsl(0,0%,12%)] shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function StepObjectives({ data, updateData, onNext, onBack }: StepObjectivesProps) {
  const { allRestrictions, loading: restrictionsLoading } = useRestrictions();
  const [selectedRestrictionIds, setSelectedRestrictionIds] = useState<string[]>([]);
  
  const isValid = !!data.objetivo;

  // Update the data with selected restriction names for display/storage
  useEffect(() => {
    const selectedRestrictions = allRestrictions.filter(r => selectedRestrictionIds.includes(r.id));
    
    // Group by category for the legacy fields
    const allergies = selectedRestrictions
      .filter(r => r.category === 'allergy')
      .map(r => r.name);
    const otherRestrictions = selectedRestrictions
      .filter(r => r.category !== 'allergy')
      .map(r => r.name);
    
    // Store restriction IDs in a custom field for later use
    updateData({ 
      alergias: allergies.join(', '),
      restricoes_alimentares: otherRestrictions.join(', '),
      // Store the IDs for saving to user_restrictions later
      _selectedRestrictionIds: selectedRestrictionIds,
    } as any);
  }, [selectedRestrictionIds, allRestrictions]);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 bg-[hsl(50,100%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-[hsl(0,0%,12%)]" />
        </div>
        <CardTitle className="text-2xl text-[hsl(0,0%,12%)]">Objetivo e Restrições</CardTitle>
        <CardDescription className="text-[hsl(0,0%,40%)]">Sua meta e restrições alimentares</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Objetivo */}
        <div className="space-y-3">
          <Label className="text-[hsl(0,0%,12%)] font-medium">Qual seu objetivo?</Label>
          <RadioGroup
            value={data.objetivo}
            onValueChange={(value) => updateData({ objetivo: value as OnboardingData['objetivo'] })}
            className="space-y-2"
          >
            {objectives.map((obj) => (
              <div key={obj.value}>
                <RadioGroupItem
                  value={obj.value}
                  id={obj.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={obj.value}
                  className={cn(
                    "flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
                    "hover:border-[hsl(50,100%,50%)] hover:bg-[hsl(50,100%,95%)]",
                    data.objetivo === obj.value 
                      ? "border-[hsl(50,100%,50%)] bg-[hsl(50,100%,90%)] text-[hsl(0,0%,12%)]" 
                      : "border-[hsl(0,0%,83%)] text-[hsl(0,0%,12%)]"
                  )}
                >
                  <span className="text-3xl">{obj.emoji}</span>
                  <div>
                    <p className="font-medium text-lg text-[hsl(0,0%,12%)]">{obj.value}</p>
                    <p className="text-sm text-[hsl(0,0%,40%)]">{obj.description}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Restrições Alimentares - New Multi-Category Selector */}
        <div className="space-y-3">
          <Label className="text-[hsl(0,0%,12%)] font-medium">
            Restrições Alimentares <span className="text-[hsl(0,0%,60%)] font-normal">(alergias, intolerâncias, dieta, etc.)</span>
          </Label>
          <div className="bg-[hsl(50,100%,97%)] border border-[hsl(50,100%,80%)] rounded-lg p-4">
            {restrictionsLoading ? (
              <div className="text-center py-4 text-[hsl(0,0%,60%)]">Carregando restrições...</div>
            ) : (
              <RestrictionSelector
                allRestrictions={allRestrictions}
                selectedIds={selectedRestrictionIds}
                onSelectionChange={setSelectedRestrictionIds}
              />
            )}
          </div>
          <p className="text-xs text-[hsl(0,0%,60%)]">
            Selecione suas alergias, intolerâncias, condições de saúde, dietas e restrições religiosas. 
            O app irá alertá-lo quando um alimento conflitar com suas restrições.
          </p>
        </div>

        {/* Preferências - Tag Input (optional) */}
        <TagInput
          label="Preferências alimentares"
          subLabel="(opcional - alimentos que você gosta)"
          value={data.preferencias_alimentares}
          onChange={(value) => updateData({ preferencias_alimentares: value })}
          placeholder="Ex: Frango, Frutas, Saladas..."
        />

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-[hsl(50,100%,50%)] text-[hsl(0,0%,12%)] bg-white hover:bg-[hsl(50,100%,95%)] min-h-[52px] font-semibold"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Voltar
          </Button>
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="flex-1 bg-[hsl(50,100%,50%)] hover:bg-[hsl(48,100%,46%)] text-[hsl(0,0%,12%)] font-bold min-h-[52px] shadow-md hover:shadow-lg transition-all disabled:bg-[hsl(0,0%,83%)] disabled:text-[hsl(0,0%,60%)]"
          >
            Próximo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
