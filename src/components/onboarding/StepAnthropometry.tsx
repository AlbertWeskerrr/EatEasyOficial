import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler, ArrowRight, ArrowLeft } from 'lucide-react';
import { OnboardingData } from './OnboardingQuestionnaire';
import { cn } from '@/lib/utils';

interface StepAnthropometryProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepAnthropometry({ data, updateData, onNext, onBack }: StepAnthropometryProps) {
  // Calculate IMC in real-time
  useEffect(() => {
    if (data.peso_kg && data.altura_cm && data.altura_cm > 0) {
      const heightM = data.altura_cm / 100;
      const imc = data.peso_kg / (heightM * heightM);
      updateData({ imc: Math.round(imc * 10) / 10 });
    }
  }, [data.peso_kg, data.altura_cm]);

  const isValid = data.altura_cm && data.peso_kg && data.altura_cm >= 100 && data.altura_cm <= 250 && data.peso_kg >= 30 && data.peso_kg <= 300;

  const getImcCategory = (imc: number | null) => {
    if (!imc) return { label: '', color: '', bg: '' };
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-700', bg: 'bg-blue-100' };
    if (imc < 25) return { label: 'Peso normal', color: 'text-green-700', bg: 'bg-green-100' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    if (imc < 35) return { label: 'Obesidade I', color: 'text-orange-700', bg: 'bg-orange-100' };
    if (imc < 40) return { label: 'Obesidade II', color: 'text-red-600', bg: 'bg-red-100' };
    return { label: 'Obesidade III', color: 'text-red-800', bg: 'bg-red-200' };
  };

  const imcInfo = getImcCategory(data.imc);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="text-center pb-2">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ruler className="w-8 h-8 text-gray-900" />
        </div>
        <CardTitle className="text-2xl text-gray-900">Medidas Corporais</CardTitle>
        <CardDescription className="text-gray-600">Informações para calcular seu IMC e necessidades</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Altura */}
        <div className="space-y-2">
          <Label htmlFor="altura" className="text-gray-900 font-medium">Altura (cm)</Label>
          <Input
            id="altura"
            type="number"
            min={100}
            max={250}
            value={data.altura_cm || ''}
            onChange={(e) => updateData({ altura_cm: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Ex: 175"
            className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 bg-white"
          />
        </div>

        {/* Peso */}
        <div className="space-y-2">
          <Label htmlFor="peso" className="text-gray-900 font-medium">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            min={30}
            max={300}
            step={0.1}
            value={data.peso_kg || ''}
            onChange={(e) => updateData({ peso_kg: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="Ex: 70"
            className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 bg-white"
          />
        </div>

        {/* Circunferência Abdominal */}
        <div className="space-y-2">
          <Label htmlFor="cintura" className="text-gray-900 font-medium">Circunferência Abdominal (cm) - Opcional</Label>
          <Input
            id="cintura"
            type="number"
            min={40}
            max={200}
            value={data.circunferencia_abdominal_cm || ''}
            onChange={(e) => updateData({ circunferencia_abdominal_cm: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Ex: 85"
            className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 text-gray-900 bg-white"
          />
        </div>

        {/* IMC Display */}
        {data.imc && (
          <div className={cn("p-4 rounded-lg border-2", imcInfo.bg)}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Seu IMC:</span>
              <span className={cn("text-2xl font-bold", imcInfo.color)}>
                {data.imc.toFixed(1)}
              </span>
            </div>
            <p className={cn("text-sm mt-1 font-medium", imcInfo.color)}>
              {imcInfo.label}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 border-yellow-500 text-gray-900 hover:bg-yellow-50 min-h-[48px]"
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
