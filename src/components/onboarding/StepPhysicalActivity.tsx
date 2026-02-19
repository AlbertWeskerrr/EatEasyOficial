import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dumbbell, ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingData } from './OnboardingQuestionnaire';
import { cn } from '@/lib/utils';

interface StepPhysicalActivityProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const activityLevels = [
  { value: 'Sedentário', description: 'Pouco ou nenhum exercício', emoji: '🧘' },
  { value: 'Leve', description: 'Exercício leve 1-3 dias/semana', emoji: '🚶' },
  { value: 'Moderada', description: 'Exercício moderado 3-5 dias/semana', emoji: '🏃' },
  { value: 'Alta', description: 'Exercício intenso 6-7 dias/semana', emoji: '💪' },
  { value: 'Muito Alta', description: 'Atleta ou trabalho físico pesado', emoji: '🏋️' },
];

const exerciseTypes = [
  { id: 'musculacao', label: 'Musculação', emoji: '🏋️' },
  { id: 'cardio', label: 'Cardio', emoji: '🏃' },
  { id: 'natacao', label: 'Natação', emoji: '🏊' },
  { id: 'ciclismo', label: 'Ciclismo', emoji: '🚴' },
  { id: 'yoga', label: 'Yoga/Pilates', emoji: '🧘' },
  { id: 'lutas', label: 'Artes Marciais', emoji: '🥋' },
  { id: 'esportes', label: 'Esportes Coletivos', emoji: '⚽' },
  { id: 'funcional', label: 'Funcional/CrossFit', emoji: '🔥' },
];

export function StepPhysicalActivity({ data, updateData, onNext, onBack }: StepPhysicalActivityProps) {
  const isValid = !!data.nivel_atividade;

  const toggleExerciseType = (typeId: string) => {
    const current = data.tipo_exercicio || [];
    if (current.includes(typeId)) {
      updateData({ tipo_exercicio: current.filter(t => t !== typeId) });
    } else {
      updateData({ tipo_exercicio: [...current, typeId] });
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 bg-[hsl(50,100%,90%)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Dumbbell className="w-8 h-8 text-gray-900" />
        </div>
        <CardTitle className="text-2xl text-gray-900">Atividade Física</CardTitle>
        <CardDescription className="text-gray-600">Seu nível de atividade e exercícios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nível de Atividade */}
        <div className="space-y-3">
          <Label className="text-gray-900 font-medium">Nível de Atividade</Label>
          <RadioGroup
            value={data.nivel_atividade}
            onValueChange={(value) => updateData({ nivel_atividade: value as OnboardingData['nivel_atividade'] })}
            className="space-y-2"
          >
            {activityLevels.map((level) => (
              <div key={level.value}>
                <RadioGroupItem
                  value={level.value}
                  id={level.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={level.value}
                  className={cn(
                    "flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all",
                    "hover:border-yellow-400 hover:bg-yellow-50",
                    data.nivel_atividade === level.value 
                      ? "border-yellow-400 bg-yellow-50" 
                      : "border-gray-300"
                  )}
                >
                  <span className="text-2xl">{level.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900">{level.value}</p>
                    <p className="text-sm text-gray-600">{level.description}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Pratica Exercício */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="pratica"
            checked={data.pratica_exercicio}
            onCheckedChange={(checked) => updateData({ pratica_exercicio: !!checked })}
            className="border-yellow-500 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-500"
          />
          <Label htmlFor="pratica" className="cursor-pointer text-gray-900">Pratico exercícios regularmente</Label>
        </div>

        {/* Frequência */}
        {data.pratica_exercicio && (
          <div className="space-y-3">
            <Label className="text-gray-900 font-medium">Frequência semanal: {data.frequencia_exercicio} dias</Label>
            <Slider
              value={[data.frequencia_exercicio]}
              onValueChange={([value]) => updateData({ frequencia_exercicio: value })}
              min={0}
              max={7}
              step={1}
              className="[&_[role=slider]]:bg-yellow-400"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>7 dias</span>
            </div>
          </div>
        )}

        {/* Tipo de Exercício */}
        {data.pratica_exercicio && (
          <div className="space-y-3">
            <Label className="text-gray-900 font-medium">Tipos de exercício (selecione todos que pratica)</Label>
            <div className="grid grid-cols-2 gap-2">
              {exerciseTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => toggleExerciseType(type.id)}
                  className={cn(
                    "flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-all",
                    "hover:border-yellow-400 hover:bg-yellow-50",
                    data.tipo_exercicio?.includes(type.id)
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-300"
                  )}
                >
                  <span>{type.emoji}</span>
                  <span className="text-sm text-gray-900">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-yellow-500 text-gray-900 bg-white hover:bg-yellow-50 min-h-[48px]"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Voltar
          </Button>
          <Button
            onClick={onNext}
            disabled={!isValid}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold min-h-[48px]"
          >
            Próximo
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
