import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, ArrowRight } from 'lucide-react';
import { OnboardingData } from './OnboardingQuestionnaire';
import { cn } from '@/lib/utils';

interface StepPersonalDataProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

// Lowercase values for database, display labels for UI
const sexOptions = [
  { value: 'masculino', label: 'Masculino', emoji: '👨' },
  { value: 'feminino', label: 'Feminino', emoji: '👩' },
  { value: 'outro', label: 'Outro', emoji: '🧑' },
] as const;

export function StepPersonalData({ data, updateData, onNext }: StepPersonalDataProps) {
  const isValid = data.nome.trim() && data.sexo && data.idade && data.idade >= 10 && data.idade <= 120;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 bg-[hsl(50,100%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-[hsl(0,0%,12%)]" />
        </div>
        <CardTitle className="text-2xl text-[hsl(0,0%,12%)]">Dados Pessoais</CardTitle>
        <CardDescription className="text-[hsl(0,0%,40%)]">Conte-nos um pouco sobre você</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-[hsl(0,0%,12%)] font-medium">Nome</Label>
          <Input
            id="nome"
            value={data.nome}
            onChange={(e) => updateData({ nome: e.target.value })}
            placeholder="Seu nome"
            className="border-[hsl(0,0%,83%)] bg-white text-[hsl(0,0%,12%)] placeholder:text-[hsl(0,0%,60%)] focus:border-[hsl(50,100%,50%)] focus:ring-[hsl(50,100%,50%)]"
          />
        </div>

        {/* Sexo */}
        <div className="space-y-3">
          <Label className="text-[hsl(0,0%,12%)] font-medium">Sexo</Label>
          <RadioGroup
            value={data.sexo}
            onValueChange={(value) => updateData({ sexo: value as OnboardingData['sexo'] })}
            className="grid grid-cols-3 gap-3"
          >
            {sexOptions.map((option) => (
              <div key={option.value}>
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className={cn(
                    "flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all",
                    "hover:border-[hsl(50,100%,50%)] hover:bg-[hsl(50,100%,95%)]",
                    data.sexo === option.value 
                      ? "border-[hsl(50,100%,50%)] bg-[hsl(50,100%,90%)] text-[hsl(0,0%,12%)]" 
                      : "border-[hsl(0,0%,83%)] text-[hsl(0,0%,12%)]"
                  )}
                >
                  <span className="mr-2">{option.emoji}</span>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Idade */}
        <div className="space-y-2">
          <Label htmlFor="idade" className="text-[hsl(0,0%,12%)] font-medium">Idade</Label>
          <Input
            id="idade"
            type="number"
            min={10}
            max={120}
            value={data.idade || ''}
            onChange={(e) => updateData({ idade: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Sua idade"
            className="border-[hsl(0,0%,83%)] bg-white text-[hsl(0,0%,12%)] placeholder:text-[hsl(0,0%,60%)] focus:border-[hsl(50,100%,50%)] focus:ring-[hsl(50,100%,50%)]"
          />
        </div>

        {/* Next Button */}
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="w-full bg-[hsl(50,100%,50%)] hover:bg-[hsl(48,100%,46%)] text-[hsl(0,0%,12%)] font-bold py-6 min-h-[52px] shadow-md hover:shadow-lg transition-all disabled:bg-[hsl(0,0%,83%)] disabled:text-[hsl(0,0%,60%)]"
        >
          Próximo
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
