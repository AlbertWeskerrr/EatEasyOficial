import { ClientData } from '@/types';

// Re-export from new database
export { allFoods as mockFoods, getFoodsByCategory, searchFoods } from './foodsDatabase';

// Mock client data for testing
export const mockClients: ClientData[] = [
  {
    email: 'joao@email.com',
    nome: 'João Silva',
    sexo: 'Masculino',
    idade: 32,
    altura: 178,
    peso: 82,
    circunferenciaAbdominal: 92,
    nivelAtividade: 'Moderada',
    praticaExercicio: true,
    frequenciaExercicio: 4,
    preferenciasAlimentares: 'Gosto de comida caseira, arroz e feijão, carnes grelhadas',
    restricoesAlimentares: 'Evito fritura e fast food',
    alergias: 'Nenhuma',
    objetivo: 'Perda de Peso',
  },
  {
    email: 'maria@email.com',
    nome: 'Maria Santos',
    sexo: 'Feminino',
    idade: 28,
    altura: 165,
    peso: 62,
    circunferenciaAbdominal: 72,
    nivelAtividade: 'Alta',
    praticaExercicio: true,
    frequenciaExercicio: 5,
    preferenciasAlimentares: 'Alimentação variada, frutas, vegetais, peixes',
    restricoesAlimentares: 'Vegetariana aos domingos',
    alergias: 'Frutos do mar',
    objetivo: 'Ganho de Massa',
  },
  {
    email: 'alex@email.com',
    nome: 'Alex Oliveira',
    sexo: 'Outro',
    idade: 25,
    altura: 172,
    peso: 70,
    circunferenciaAbdominal: 78,
    nivelAtividade: 'Leve',
    praticaExercicio: true,
    frequenciaExercicio: 2,
    preferenciasAlimentares: 'Flexível, gosto de experimentar novos alimentos',
    restricoesAlimentares: 'Sem glúten',
    alergias: 'Glúten',
    objetivo: 'Manutenção',
  },
];

// Function to find client by email
export function findClientByEmail(email: string): ClientData | undefined {
  return mockClients.find(client => client.email.toLowerCase() === email.toLowerCase());
}
