import { Food, Beverage, Sweet } from '@/types';

// =================== PROTEÍNAS ===================
export const proteinFoods: Food[] = [
  { id: 'p1', nome: 'Frango Grelhado (Peito)', categoria: 'Proteínas', calorias: 165, proteinas: 31, carboidratos: 0, gorduras: 3.6, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 filé' },
  { id: 'p2', nome: 'Ovo Inteiro Cozido', categoria: 'Proteínas', calorias: 155, proteinas: 13, carboidratos: 1.1, gorduras: 11, unidade: 'g', porcaoPadrao: 50, porcaoDescricao: '1 ovo' },
  { id: 'p3', nome: 'Carne Bovina Magra', categoria: 'Proteínas', calorias: 143, proteinas: 26, carboidratos: 0, gorduras: 4.6, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 bife' },
  { id: 'p4', nome: 'Tilápia Grelhada', categoria: 'Proteínas', calorias: 96, proteinas: 20, carboidratos: 0, gorduras: 1.7, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 filé' },
  { id: 'p5', nome: 'Atum em Conserva', categoria: 'Proteínas', calorias: 116, proteinas: 26, carboidratos: 0, gorduras: 0.8, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 lata drenada' },
  { id: 'p6', nome: 'Peito de Peru', categoria: 'Proteínas', calorias: 104, proteinas: 24, carboidratos: 0, gorduras: 1, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 fatias' },
  { id: 'p9', nome: 'Whey Protein', categoria: 'Proteínas', calorias: 120, proteinas: 24, carboidratos: 3, gorduras: 1.5, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '1 scoop' },
  { id: 'p10', nome: 'Salmão Grelhado', categoria: 'Proteínas', calorias: 208, proteinas: 20, carboidratos: 0, gorduras: 13, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 filé' },
  { id: 'p11', nome: 'Camarão Cozido', categoria: 'Proteínas', calorias: 99, proteinas: 24, carboidratos: 0.2, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '10 unidades' },
  { id: 'p12', nome: 'Tofu Firme', categoria: 'Proteínas', calorias: 144, proteinas: 15, carboidratos: 3, gorduras: 8, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '3 fatias' },
  { id: 'p13', nome: 'Carne de Porco Magra', categoria: 'Proteínas', calorias: 143, proteinas: 27, carboidratos: 0, gorduras: 3, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 bife' },
  { id: 'p14', nome: 'Patinho Bovino', categoria: 'Proteínas', calorias: 133, proteinas: 27, carboidratos: 0, gorduras: 2.5, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 bife' },
  { id: 'p15', nome: 'Frango Desfiado', categoria: 'Proteínas', calorias: 165, proteinas: 31, carboidratos: 0, gorduras: 3.6, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ xícara' },
  { id: 'p16', nome: 'Sardinha em Conserva', categoria: 'Proteínas', calorias: 208, proteinas: 25, carboidratos: 0, gorduras: 11, unidade: 'g', porcaoPadrao: 60, porcaoDescricao: '1 lata' },
  { id: 'p19', nome: 'Clara de Ovo', categoria: 'Proteínas', calorias: 52, proteinas: 11, carboidratos: 0.7, gorduras: 0.2, unidade: 'g', porcaoPadrao: 33, porcaoDescricao: '1 clara' },
  { id: 'p20', nome: 'Lombo Suíno', categoria: 'Proteínas', calorias: 145, proteinas: 26, carboidratos: 0, gorduras: 4, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 fatia' },
];

// =================== GRÃOS ===================
export const grainFoods: Food[] = [
  { id: 'gr1', nome: 'Arroz Integral', categoria: 'Grãos', calorias: 130, proteinas: 2.7, carboidratos: 28, gorduras: 1, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '4 colheres' },
  { id: 'gr2', nome: 'Arroz Branco', categoria: 'Grãos', calorias: 130, proteinas: 2.5, carboidratos: 28, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '4 colheres' },
  { id: 'gr3', nome: 'Batata Doce', categoria: 'Grãos', calorias: 86, proteinas: 1.6, carboidratos: 20, gorduras: 0.1, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 média' },
  { id: 'gr4', nome: 'Batata Inglesa', categoria: 'Grãos', calorias: 77, proteinas: 2, carboidratos: 17, gorduras: 0.1, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 média' },
  { id: 'gr5', nome: 'Aveia em Flocos', categoria: 'Grãos', calorias: 389, proteinas: 17, carboidratos: 66, gorduras: 7, unidade: 'g', porcaoPadrao: 40, porcaoDescricao: '4 colheres' },
  { id: 'gr6', nome: 'Pão Integral', categoria: 'Grãos', calorias: 247, proteinas: 13, carboidratos: 41, gorduras: 4.2, unidade: 'g', porcaoPadrao: 50, porcaoDescricao: '2 fatias' },
  { id: 'gr7', nome: 'Pão Francês', categoria: 'Grãos', calorias: 289, proteinas: 9, carboidratos: 58, gorduras: 3.1, unidade: 'g', porcaoPadrao: 50, porcaoDescricao: '1 unidade' },
  { id: 'gr8', nome: 'Macarrão Integral', categoria: 'Grãos', calorias: 124, proteinas: 5, carboidratos: 25, gorduras: 0.5, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 prato' },
  { id: 'gr9', nome: 'Quinoa Cozida', categoria: 'Grãos', calorias: 120, proteinas: 4.4, carboidratos: 21, gorduras: 1.9, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ xícara' },
  { id: 'gr10', nome: 'Mandioca Cozida', categoria: 'Grãos', calorias: 125, proteinas: 1.2, carboidratos: 30, gorduras: 0.2, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '3 pedaços' },
  { id: 'gr11', nome: 'Feijão Preto', categoria: 'Grãos', calorias: 77, proteinas: 4.5, carboidratos: 14, gorduras: 0.5, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 concha' },
  { id: 'gr12', nome: 'Feijão Carioca', categoria: 'Grãos', calorias: 76, proteinas: 4.8, carboidratos: 13.6, gorduras: 0.5, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 concha' },
  { id: 'gr13', nome: 'Grão de Bico', categoria: 'Grãos', calorias: 164, proteinas: 8.9, carboidratos: 27, gorduras: 2.6, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ xícara' },
  { id: 'gr14', nome: 'Lentilha', categoria: 'Grãos', calorias: 116, proteinas: 9, carboidratos: 20, gorduras: 0.4, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ xícara' },
  { id: 'gr15', nome: 'Tapioca', categoria: 'Grãos', calorias: 358, proteinas: 0.1, carboidratos: 88, gorduras: 0.1, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 colheres' },
  { id: 'gr16', nome: 'Cuscuz de Milho', categoria: 'Grãos', calorias: 112, proteinas: 2.5, carboidratos: 25, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 fatia' },
  { id: 'gr17', nome: 'Inhame Cozido', categoria: 'Grãos', calorias: 97, proteinas: 2, carboidratos: 23, gorduras: 0.1, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 pedaço' },
  { id: 'gr18', nome: 'Granola', categoria: 'Grãos', calorias: 421, proteinas: 10, carboidratos: 64, gorduras: 15, unidade: 'g', porcaoPadrao: 40, porcaoDescricao: '4 colheres' },
  { id: 'gr19', nome: 'Mel', categoria: 'Grãos', calorias: 304, proteinas: 0.3, carboidratos: 82, gorduras: 0, unidade: 'g', porcaoPadrao: 20, porcaoDescricao: '1 colher' },
];

// =================== FRUTAS ===================
export const fruitFoods: Food[] = [
  { id: 'fr1', nome: 'Banana', categoria: 'Frutas', calorias: 89, proteinas: 1.1, carboidratos: 23, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 média' },
  { id: 'fr2', nome: 'Maçã', categoria: 'Frutas', calorias: 52, proteinas: 0.3, carboidratos: 14, gorduras: 0.2, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 média' },
  { id: 'fr3', nome: 'Laranja', categoria: 'Frutas', calorias: 47, proteinas: 0.9, carboidratos: 12, gorduras: 0.1, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 média' },
  { id: 'fr4', nome: 'Mamão Papaia', categoria: 'Frutas', calorias: 43, proteinas: 0.5, carboidratos: 11, gorduras: 0.3, unidade: 'g', porcaoPadrao: 200, porcaoDescricao: '1 fatia' },
  { id: 'fr5', nome: 'Manga', categoria: 'Frutas', calorias: 60, proteinas: 0.8, carboidratos: 15, gorduras: 0.4, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 xícara' },
  { id: 'fr6', nome: 'Morango', categoria: 'Frutas', calorias: 32, proteinas: 0.7, carboidratos: 7.7, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '10 unidades' },
  { id: 'fr7', nome: 'Abacaxi', categoria: 'Frutas', calorias: 50, proteinas: 0.5, carboidratos: 13, gorduras: 0.1, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 fatia' },
  { id: 'fr8', nome: 'Uva', categoria: 'Frutas', calorias: 69, proteinas: 0.7, carboidratos: 18, gorduras: 0.2, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 cacho pequeno' },
  { id: 'fr9', nome: 'Melancia', categoria: 'Frutas', calorias: 30, proteinas: 0.6, carboidratos: 7.5, gorduras: 0.2, unidade: 'g', porcaoPadrao: 200, porcaoDescricao: '1 fatia' },
  { id: 'fr10', nome: 'Melão', categoria: 'Frutas', calorias: 34, proteinas: 0.8, carboidratos: 8, gorduras: 0.2, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 fatia' },
  { id: 'fr11', nome: 'Kiwi', categoria: 'Frutas', calorias: 61, proteinas: 1.1, carboidratos: 15, gorduras: 0.5, unidade: 'g', porcaoPadrao: 75, porcaoDescricao: '1 unidade' },
  { id: 'fr12', nome: 'Pera', categoria: 'Frutas', calorias: 57, proteinas: 0.4, carboidratos: 15, gorduras: 0.1, unidade: 'g', porcaoPadrao: 150, porcaoDescricao: '1 média' },
];

// =================== LATICÍNIOS ===================
export const dairyFoods: Food[] = [
  { id: 'lc1', nome: 'Queijo Cottage', categoria: 'Laticínios', calorias: 98, proteinas: 11, carboidratos: 3.4, gorduras: 4.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ xícara' },
  { id: 'lc2', nome: 'Iogurte Grego Natural', categoria: 'Laticínios', calorias: 100, proteinas: 17, carboidratos: 6, gorduras: 0.7, unidade: 'g', porcaoPadrao: 170, porcaoDescricao: '1 pote' },
  { id: 'lc3', nome: 'Queijo Minas Frescal', categoria: 'Laticínios', calorias: 264, proteinas: 17, carboidratos: 3, gorduras: 20, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '1 fatia' },
  { id: 'lc4', nome: 'Ricota', categoria: 'Laticínios', calorias: 140, proteinas: 12, carboidratos: 3, gorduras: 9, unidade: 'g', porcaoPadrao: 50, porcaoDescricao: '2 colheres' },
  { id: 'lc5', nome: 'Leite Integral', categoria: 'Laticínios', calorias: 61, proteinas: 3.2, carboidratos: 4.8, gorduras: 3.3, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'lc6', nome: 'Leite Desnatado', categoria: 'Laticínios', calorias: 35, proteinas: 3.4, carboidratos: 5, gorduras: 0.1, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'lc7', nome: 'Iogurte Natural', categoria: 'Laticínios', calorias: 59, proteinas: 3.5, carboidratos: 4.7, gorduras: 3, unidade: 'g', porcaoPadrao: 170, porcaoDescricao: '1 pote' },
  { id: 'lc8', nome: 'Queijo Muçarela', categoria: 'Laticínios', calorias: 280, proteinas: 22, carboidratos: 2, gorduras: 21, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 fatias' },
  { id: 'lc9', nome: 'Requeijão', categoria: 'Laticínios', calorias: 257, proteinas: 4, carboidratos: 3, gorduras: 26, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '1 colher' },
  { id: 'lc10', nome: 'Cream Cheese Light', categoria: 'Laticínios', calorias: 150, proteinas: 6, carboidratos: 5, gorduras: 12, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '1 colher' },
];

// =================== OLEAGINOSAS ===================
export const nutFoods: Food[] = [
  { id: 'ol1', nome: 'Abacate', categoria: 'Oleaginosas', calorias: 160, proteinas: 2, carboidratos: 8.5, gorduras: 15, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ unidade' },
  { id: 'ol2', nome: 'Azeite de Oliva', categoria: 'Oleaginosas', calorias: 884, proteinas: 0, carboidratos: 0, gorduras: 100, unidade: 'ml', porcaoPadrao: 15, porcaoDescricao: '1 colher' },
  { id: 'ol3', nome: 'Castanha do Pará', categoria: 'Oleaginosas', calorias: 656, proteinas: 14, carboidratos: 12, gorduras: 66, unidade: 'g', porcaoPadrao: 20, porcaoDescricao: '4 unidades' },
  { id: 'ol4', nome: 'Amendoim Torrado', categoria: 'Oleaginosas', calorias: 567, proteinas: 26, carboidratos: 16, gorduras: 49, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 colheres' },
  { id: 'ol5', nome: 'Pasta de Amendoim', categoria: 'Oleaginosas', calorias: 588, proteinas: 25, carboidratos: 20, gorduras: 50, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '1 colher' },
  { id: 'ol6', nome: 'Óleo de Coco', categoria: 'Oleaginosas', calorias: 862, proteinas: 0, carboidratos: 0, gorduras: 100, unidade: 'ml', porcaoPadrao: 15, porcaoDescricao: '1 colher' },
  { id: 'ol7', nome: 'Semente de Chia', categoria: 'Oleaginosas', calorias: 486, proteinas: 17, carboidratos: 42, gorduras: 31, unidade: 'g', porcaoPadrao: 15, porcaoDescricao: '1 colher' },
  { id: 'ol8', nome: 'Nozes', categoria: 'Oleaginosas', calorias: 654, proteinas: 15, carboidratos: 14, gorduras: 65, unidade: 'g', porcaoPadrao: 20, porcaoDescricao: '5 unidades' },
  { id: 'ol9', nome: 'Amêndoas', categoria: 'Oleaginosas', calorias: 579, proteinas: 21, carboidratos: 22, gorduras: 50, unidade: 'g', porcaoPadrao: 25, porcaoDescricao: '10 unidades' },
  { id: 'ol10', nome: 'Semente de Linhaça', categoria: 'Oleaginosas', calorias: 534, proteinas: 18, carboidratos: 29, gorduras: 42, unidade: 'g', porcaoPadrao: 15, porcaoDescricao: '1 colher' },
  { id: 'ol11', nome: 'Manteiga', categoria: 'Oleaginosas', calorias: 717, proteinas: 0.9, carboidratos: 0.1, gorduras: 81, unidade: 'g', porcaoPadrao: 10, porcaoDescricao: '1 colher chá' },
  { id: 'ol12', nome: 'Azeitona Preta', categoria: 'Oleaginosas', calorias: 115, proteinas: 0.8, carboidratos: 6, gorduras: 11, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '6 unidades' },
  { id: 'ol13', nome: 'Coco Ralado', categoria: 'Oleaginosas', calorias: 660, proteinas: 6, carboidratos: 24, gorduras: 64, unidade: 'g', porcaoPadrao: 20, porcaoDescricao: '2 colheres' },
  { id: 'ol14', nome: 'Tahine', categoria: 'Oleaginosas', calorias: 595, proteinas: 17, carboidratos: 21, gorduras: 54, unidade: 'g', porcaoPadrao: 20, porcaoDescricao: '1 colher' },
];

// =================== VERDURAS ===================
export const vegetableFoods: Food[] = [
  { id: 'v1', nome: 'Brócolis', categoria: 'Verduras', calorias: 34, proteinas: 2.8, carboidratos: 7, gorduras: 0.4, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 xícara' },
  { id: 'v2', nome: 'Espinafre', categoria: 'Verduras', calorias: 23, proteinas: 2.9, carboidratos: 3.6, gorduras: 0.4, unidade: 'g', porcaoPadrao: 50, porcaoDescricao: '1 xícara' },
  { id: 'v3', nome: 'Tomate', categoria: 'Verduras', calorias: 18, proteinas: 0.9, carboidratos: 3.9, gorduras: 0.2, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 médio' },
  { id: 'v4', nome: 'Cenoura', categoria: 'Verduras', calorias: 41, proteinas: 0.9, carboidratos: 10, gorduras: 0.2, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 média' },
  { id: 'v5', nome: 'Alface', categoria: 'Verduras', calorias: 15, proteinas: 1.4, carboidratos: 2.9, gorduras: 0.2, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 folhas' },
  { id: 'v6', nome: 'Pepino', categoria: 'Verduras', calorias: 16, proteinas: 0.7, carboidratos: 3.6, gorduras: 0.1, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ unidade' },
  { id: 'v7', nome: 'Abobrinha', categoria: 'Verduras', calorias: 17, proteinas: 1.2, carboidratos: 3.1, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 pequena' },
  { id: 'v8', nome: 'Couve-Flor', categoria: 'Verduras', calorias: 25, proteinas: 1.9, carboidratos: 5, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 xícara' },
  { id: 'v9', nome: 'Rúcula', categoria: 'Verduras', calorias: 25, proteinas: 2.6, carboidratos: 3.7, gorduras: 0.7, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '1 xícara' },
  { id: 'v10', nome: 'Pimentão Vermelho', categoria: 'Verduras', calorias: 31, proteinas: 1, carboidratos: 6, gorduras: 0.3, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '½ unidade' },
  { id: 'v11', nome: 'Berinjela', categoria: 'Verduras', calorias: 25, proteinas: 1, carboidratos: 6, gorduras: 0.2, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '3 fatias' },
  { id: 'v12', nome: 'Cebola', categoria: 'Verduras', calorias: 40, proteinas: 1.1, carboidratos: 9, gorduras: 0.1, unidade: 'g', porcaoPadrao: 50, porcaoDescricao: '½ unidade' },
  { id: 'v13', nome: 'Couve Manteiga', categoria: 'Verduras', calorias: 27, proteinas: 2.9, carboidratos: 4.3, gorduras: 0.5, unidade: 'g', porcaoPadrao: 50, porcaoDescricao: '2 folhas' },
  { id: 'v14', nome: 'Repolho', categoria: 'Verduras', calorias: 25, proteinas: 1.3, carboidratos: 6, gorduras: 0.1, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 xícara' },
  { id: 'v15', nome: 'Beterraba', categoria: 'Verduras', calorias: 43, proteinas: 1.6, carboidratos: 10, gorduras: 0.2, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 pequena' },
];

// (Old carbFoods, fatFoods, vegetableFoods removed - now split into grainFoods, fruitFoods, dairyFoods, nutFoods, vegetableFoods above)

// =================== BEBIDAS ===================
export const beverages: Beverage[] = [
  // Água
  { id: 'b1', nome: 'Água Natural', categoria: 'Bebidas', tipoBebida: 'agua', calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b2', nome: 'Água com Limão', categoria: 'Bebidas', tipoBebida: 'agua', calorias: 3, proteinas: 0, carboidratos: 1, gorduras: 0, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b3', nome: 'Água Aromatizada', categoria: 'Bebidas', tipoBebida: 'agua', calorias: 5, proteinas: 0, carboidratos: 1.5, gorduras: 0, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b4', nome: 'Água de Coco', categoria: 'Bebidas', tipoBebida: 'agua', calorias: 19, proteinas: 0.7, carboidratos: 4, gorduras: 0.2, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 caixa' },
  
  // Café e Chá
  { id: 'b5', nome: 'Café Preto (Espresso)', categoria: 'Bebidas', tipoBebida: 'cafe', calorias: 2, proteinas: 0.1, carboidratos: 0, gorduras: 0, unidade: 'ml', porcaoPadrao: 50, porcaoDescricao: '1 xícara pequena' },
  { id: 'b6', nome: 'Café com Leite', categoria: 'Bebidas', tipoBebida: 'cafe', calorias: 50, proteinas: 2.5, carboidratos: 5, gorduras: 2, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 xícara' },
  { id: 'b7', nome: 'Cappuccino', categoria: 'Bebidas', tipoBebida: 'cafe', calorias: 90, proteinas: 3, carboidratos: 12, gorduras: 3, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 xícara' },
  { id: 'b8', nome: 'Café com Açúcar', categoria: 'Bebidas', tipoBebida: 'cafe', calorias: 20, proteinas: 0.1, carboidratos: 5, gorduras: 0, unidade: 'ml', porcaoPadrao: 50, porcaoDescricao: '1 xícara' },
  { id: 'b9', nome: 'Chá Verde', categoria: 'Bebidas', tipoBebida: 'cha', calorias: 2, proteinas: 0, carboidratos: 0.5, gorduras: 0, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 xícara' },
  { id: 'b10', nome: 'Chá Preto', categoria: 'Bebidas', tipoBebida: 'cha', calorias: 2, proteinas: 0, carboidratos: 0.5, gorduras: 0, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 xícara' },
  { id: 'b11', nome: 'Chá de Camomila', categoria: 'Bebidas', tipoBebida: 'cha', calorias: 1, proteinas: 0, carboidratos: 0.2, gorduras: 0, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 xícara' },
  
  // Sucos Naturais
  { id: 'b12', nome: 'Suco Natural de Laranja', categoria: 'Bebidas', tipoBebida: 'suco_natural', calorias: 45, proteinas: 0.7, carboidratos: 10, gorduras: 0.2, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b13', nome: 'Suco Natural de Maçã', categoria: 'Bebidas', tipoBebida: 'suco_natural', calorias: 46, proteinas: 0.1, carboidratos: 11, gorduras: 0.1, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b14', nome: 'Suco Natural de Morango', categoria: 'Bebidas', tipoBebida: 'suco_natural', calorias: 33, proteinas: 0.7, carboidratos: 7, gorduras: 0.3, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b15', nome: 'Suco Natural de Melancia', categoria: 'Bebidas', tipoBebida: 'suco_natural', calorias: 30, proteinas: 0.6, carboidratos: 7.5, gorduras: 0.2, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b16', nome: 'Suco Verde Detox', categoria: 'Bebidas', tipoBebida: 'suco_natural', calorias: 35, proteinas: 1, carboidratos: 8, gorduras: 0.1, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b17', nome: 'Suco de Abacaxi', categoria: 'Bebidas', tipoBebida: 'suco_natural', calorias: 50, proteinas: 0.4, carboidratos: 13, gorduras: 0.1, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  { id: 'b18', nome: 'Suco de Uva Integral', categoria: 'Bebidas', tipoBebida: 'suco_natural', calorias: 60, proteinas: 0.3, carboidratos: 15, gorduras: 0, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 copo' },
  
  // Sucos Industrializados
  { id: 'b19', nome: 'Suco de Caixinha', categoria: 'Bebidas', tipoBebida: 'suco_industrial', calorias: 42, proteinas: 0.5, carboidratos: 10, gorduras: 0, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 caixa' },
  { id: 'b20', nome: 'Néctar de Fruta', categoria: 'Bebidas', tipoBebida: 'suco_industrial', calorias: 65, proteinas: 0.3, carboidratos: 16, gorduras: 0, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 caixa' },
  
  // Refrigerantes
  { id: 'b21', nome: 'Refrigerante Normal', categoria: 'Bebidas', tipoBebida: 'refrigerante', calorias: 42, proteinas: 0, carboidratos: 10.6, gorduras: 0, unidade: 'ml', porcaoPadrao: 350, porcaoDescricao: '1 lata' },
  { id: 'b22', nome: 'Refrigerante Zero/Diet', categoria: 'Bebidas', tipoBebida: 'refrigerante', calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, unidade: 'ml', porcaoPadrao: 350, porcaoDescricao: '1 lata' },
  { id: 'b23', nome: 'Refrigerante Light', categoria: 'Bebidas', tipoBebida: 'refrigerante', calorias: 11, proteinas: 0, carboidratos: 2.8, gorduras: 0, unidade: 'ml', porcaoPadrao: 350, porcaoDescricao: '1 lata' },
  
  // Energéticos
  { id: 'b24', nome: 'Energético Normal', categoria: 'Bebidas', tipoBebida: 'energetico', calorias: 45, proteinas: 0, carboidratos: 11, gorduras: 0, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 lata' },
  { id: 'b25', nome: 'Energético Zero', categoria: 'Bebidas', tipoBebida: 'energetico', calorias: 4, proteinas: 0, carboidratos: 0, gorduras: 0, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 lata' },
  { id: 'b26', nome: 'Achocolatado', categoria: 'Bebidas', tipoBebida: 'energetico', calorias: 75, proteinas: 2.5, carboidratos: 14, gorduras: 1, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'b27', nome: 'Isotônico', categoria: 'Bebidas', tipoBebida: 'energetico', calorias: 24, proteinas: 0, carboidratos: 6, gorduras: 0, unidade: 'ml', porcaoPadrao: 500, porcaoDescricao: '1 garrafa' },
  
  // Leites
  { id: 'b28', nome: 'Leite Integral', categoria: 'Bebidas', tipoBebida: 'leite', calorias: 60, proteinas: 3, carboidratos: 5, gorduras: 3, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'b29', nome: 'Leite Desnatado', categoria: 'Bebidas', tipoBebida: 'leite', calorias: 35, proteinas: 3.4, carboidratos: 5, gorduras: 0.1, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'b30', nome: 'Leite Semidesnatado', categoria: 'Bebidas', tipoBebida: 'leite', calorias: 46, proteinas: 3.2, carboidratos: 5, gorduras: 1.5, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'b31', nome: 'Leite de Amêndoa', categoria: 'Bebidas', tipoBebida: 'leite', calorias: 17, proteinas: 0.6, carboidratos: 1.5, gorduras: 1, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'b32', nome: 'Leite de Coco', categoria: 'Bebidas', tipoBebida: 'leite', calorias: 45, proteinas: 0.2, carboidratos: 1, gorduras: 4.5, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  { id: 'b33', nome: 'Leite de Aveia', categoria: 'Bebidas', tipoBebida: 'leite', calorias: 50, proteinas: 1, carboidratos: 9, gorduras: 1.5, unidade: 'ml', porcaoPadrao: 200, porcaoDescricao: '1 copo' },
  
  // Lácteos
  { id: 'b34', nome: 'Iogurte Bebível', categoria: 'Bebidas', tipoBebida: 'lacteo', calorias: 53, proteinas: 2, carboidratos: 9, gorduras: 1, unidade: 'ml', porcaoPadrao: 150, porcaoDescricao: '1 garrafa' },
  { id: 'b35', nome: 'Whey Shake Pronto', categoria: 'Bebidas', tipoBebida: 'lacteo', calorias: 48, proteinas: 8, carboidratos: 3, gorduras: 0.5, unidade: 'ml', porcaoPadrao: 250, porcaoDescricao: '1 garrafa' },
  { id: 'b36', nome: 'Vitamina de Frutas', categoria: 'Bebidas', tipoBebida: 'lacteo', calorias: 80, proteinas: 3, carboidratos: 14, gorduras: 1.5, unidade: 'ml', porcaoPadrao: 300, porcaoDescricao: '1 copo grande' },
];

// =================== DOCES ===================
export const sweets: Sweet[] = [
  // Chocolates
  { id: 's1', nome: 'Brigadeiro Gourmet', categoria: 'Doces', tipoDoce: 'chocolate', calorias: 350, proteinas: 4, carboidratos: 55, gorduras: 12, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 unidades' },
  { id: 's2', nome: 'Brownie', categoria: 'Doces', tipoDoce: 'chocolate', calorias: 466, proteinas: 6, carboidratos: 54, gorduras: 25, unidade: 'g', porcaoPadrao: 60, porcaoDescricao: '1 fatia' },
  { id: 's3', nome: 'Torta de Chocolate', categoria: 'Doces', tipoDoce: 'chocolate', calorias: 450, proteinas: 5, carboidratos: 52, gorduras: 24, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 fatia' },
  { id: 's4', nome: 'Mousse de Chocolate', categoria: 'Doces', tipoDoce: 'sobremesa', calorias: 320, proteinas: 4, carboidratos: 35, gorduras: 18, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 taça' },
  { id: 's5', nome: 'Chocolate ao Leite', categoria: 'Doces', tipoDoce: 'chocolate', calorias: 535, proteinas: 8, carboidratos: 59, gorduras: 30, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '6 quadrados' },
  { id: 's6', nome: 'Chocolate Amargo 70%', categoria: 'Doces', tipoDoce: 'chocolate', calorias: 598, proteinas: 8, carboidratos: 46, gorduras: 43, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '6 quadrados' },
  { id: 's7', nome: 'Trufa de Chocolate', categoria: 'Doces', tipoDoce: 'chocolate', calorias: 490, proteinas: 5, carboidratos: 55, gorduras: 28, unidade: 'g', porcaoPadrao: 25, porcaoDescricao: '1 unidade' },
  
  // Bolos
  { id: 's8', nome: 'Bolo de Cenoura', categoria: 'Doces', tipoDoce: 'bolo', calorias: 340, proteinas: 4, carboidratos: 48, gorduras: 14, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 fatia' },
  { id: 's9', nome: 'Bolo de Chocolate', categoria: 'Doces', tipoDoce: 'bolo', calorias: 370, proteinas: 5, carboidratos: 52, gorduras: 16, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 fatia' },
  { id: 's10', nome: 'Bolo de Banana', categoria: 'Doces', tipoDoce: 'bolo', calorias: 290, proteinas: 4, carboidratos: 45, gorduras: 10, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 fatia' },
  { id: 's11', nome: 'Bolo de Milho', categoria: 'Doces', tipoDoce: 'bolo', calorias: 310, proteinas: 4, carboidratos: 50, gorduras: 10, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 fatia' },
  { id: 's12', nome: 'Bolo de Fubá', categoria: 'Doces', tipoDoce: 'bolo', calorias: 280, proteinas: 4, carboidratos: 42, gorduras: 10, unidade: 'g', porcaoPadrao: 80, porcaoDescricao: '1 fatia' },
  
  // Sobremesas
  { id: 's13', nome: 'Pavê de Chocolate', categoria: 'Doces', tipoDoce: 'sobremesa', calorias: 380, proteinas: 6, carboidratos: 48, gorduras: 18, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 fatia' },
  { id: 's14', nome: 'Pudim de Leite', categoria: 'Doces', tipoDoce: 'sobremesa', calorias: 290, proteinas: 5, carboidratos: 48, gorduras: 8, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 fatia' },
  { id: 's15', nome: 'Cheesecake', categoria: 'Doces', tipoDoce: 'sobremesa', calorias: 321, proteinas: 5, carboidratos: 27, gorduras: 22, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 fatia' },
  { id: 's16', nome: 'Petit Gateau', categoria: 'Doces', tipoDoce: 'sobremesa', calorias: 420, proteinas: 6, carboidratos: 45, gorduras: 24, unidade: 'g', porcaoPadrao: 120, porcaoDescricao: '1 unidade' },
  { id: 's17', nome: 'Tiramisu', categoria: 'Doces', tipoDoce: 'sobremesa', calorias: 283, proteinas: 5, carboidratos: 28, gorduras: 16, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '1 fatia' },
  
  // Sorvetes
  { id: 's18', nome: 'Sorvete de Chocolate', categoria: 'Doces', tipoDoce: 'sorvete', calorias: 216, proteinas: 4, carboidratos: 28, gorduras: 10, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '2 bolas' },
  { id: 's19', nome: 'Sorvete de Creme', categoria: 'Doces', tipoDoce: 'sorvete', calorias: 207, proteinas: 4, carboidratos: 24, gorduras: 11, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '2 bolas' },
  { id: 's20', nome: 'Sorvete de Morango', categoria: 'Doces', tipoDoce: 'sorvete', calorias: 192, proteinas: 3, carboidratos: 25, gorduras: 9, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '2 bolas' },
  { id: 's21', nome: 'Açaí na Tigela', categoria: 'Doces', tipoDoce: 'sorvete', calorias: 247, proteinas: 3, carboidratos: 52, gorduras: 3, unidade: 'g', porcaoPadrao: 200, porcaoDescricao: '1 tigela' },
  { id: 's22', nome: 'Picolé de Frutas', categoria: 'Doces', tipoDoce: 'sorvete', calorias: 70, proteinas: 0.5, carboidratos: 17, gorduras: 0.1, unidade: 'g', porcaoPadrao: 60, porcaoDescricao: '1 unidade' },
  
  // Biscoitos
  { id: 's23', nome: 'Cookie de Chocolate', categoria: 'Doces', tipoDoce: 'biscoito', calorias: 490, proteinas: 5, carboidratos: 65, gorduras: 24, unidade: 'g', porcaoPadrao: 40, porcaoDescricao: '2 unidades' },
  { id: 's24', nome: 'Biscoito Recheado', categoria: 'Doces', tipoDoce: 'biscoito', calorias: 475, proteinas: 5, carboidratos: 68, gorduras: 20, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '3 unidades' },
  { id: 's25', nome: 'Wafer', categoria: 'Doces', tipoDoce: 'biscoito', calorias: 500, proteinas: 4, carboidratos: 65, gorduras: 25, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '3 unidades' },
  
  // Frutas em Calda
  { id: 's26', nome: 'Goiabada', categoria: 'Doces', tipoDoce: 'fruta_calda', calorias: 300, proteinas: 0.5, carboidratos: 75, gorduras: 0.1, unidade: 'g', porcaoPadrao: 40, porcaoDescricao: '1 fatia' },
  { id: 's27', nome: 'Doce de Leite', categoria: 'Doces', tipoDoce: 'fruta_calda', calorias: 315, proteinas: 6, carboidratos: 55, gorduras: 8, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 colheres' },
  { id: 's28', nome: 'Compota de Pêssego', categoria: 'Doces', tipoDoce: 'fruta_calda', calorias: 74, proteinas: 0.4, carboidratos: 18, gorduras: 0.1, unidade: 'g', porcaoPadrao: 100, porcaoDescricao: '2 metades' },
  
  // Doces Caseiros
  { id: 's29', nome: 'Beijinho', categoria: 'Doces', tipoDoce: 'doce_caseiro', calorias: 340, proteinas: 3, carboidratos: 55, gorduras: 12, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 unidades' },
  { id: 's30', nome: 'Cajuzinho', categoria: 'Doces', tipoDoce: 'doce_caseiro', calorias: 320, proteinas: 5, carboidratos: 52, gorduras: 10, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '2 unidades' },
  { id: 's31', nome: 'Cocada', categoria: 'Doces', tipoDoce: 'doce_caseiro', calorias: 420, proteinas: 3, carboidratos: 62, gorduras: 18, unidade: 'g', porcaoPadrao: 40, porcaoDescricao: '1 pedaço' },
  { id: 's32', nome: 'Paçoca', categoria: 'Doces', tipoDoce: 'doce_caseiro', calorias: 450, proteinas: 12, carboidratos: 52, gorduras: 22, unidade: 'g', porcaoPadrao: 25, porcaoDescricao: '1 unidade' },
  { id: 's33', nome: 'Pé de Moleque', categoria: 'Doces', tipoDoce: 'doce_caseiro', calorias: 430, proteinas: 10, carboidratos: 55, gorduras: 20, unidade: 'g', porcaoPadrao: 30, porcaoDescricao: '1 pedaço' },
  { id: 's34', nome: 'Romeu e Julieta', categoria: 'Doces', tipoDoce: 'doce_caseiro', calorias: 280, proteinas: 5, carboidratos: 45, gorduras: 9, unidade: 'g', porcaoPadrao: 60, porcaoDescricao: '1 porção' },
];

// =================== ALL FOODS COMBINED ===================
export const allFoods: Food[] = [
  ...proteinFoods,
  ...grainFoods,
  ...fruitFoods,
  ...dairyFoods,
  ...nutFoods,
  ...vegetableFoods,
  ...beverages,
  ...sweets,
];

// =================== HELPER FUNCTIONS ===================
export function searchFoods(query: string, category?: Food['categoria']): Food[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  let foods = allFoods;
  if (category) {
    foods = foods.filter(f => f.categoria === category);
  }
  
  return foods.filter(food => {
    const normalizedName = food.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizedName.includes(normalizedQuery);
  });
}

export function getFoodsByCategory(category: Food['categoria']): Food[] {
  return allFoods.filter(food => food.categoria === category);
}

export function getBeveragesByType(type: Beverage['tipoBebida']): Beverage[] {
  return beverages.filter(b => b.tipoBebida === type);
}

export function getSweetsByType(type: Sweet['tipoDoce']): Sweet[] {
  return sweets.filter(s => s.tipoDoce === type);
}

// Get "Doce do Dia" based on current date (deterministic)
export function getDailySweet(): Sweet {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash function for deterministic selection
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % sweets.length;
  return sweets[index];
}

// Beverage type labels
export const beverageTypeLabels: Record<Beverage['tipoBebida'], string> = {
  agua: '💧 Água',
  cafe: '☕ Café e Chá',
  cha: '🍵 Chás',
  suco_natural: '🍊 Sucos Naturais',
  suco_industrial: '🧃 Sucos Industrializados',
  refrigerante: '🥤 Refrigerantes',
  energetico: '⚡ Energéticos',
  leite: '🥛 Leites',
  lacteo: '🧈 Lácteos',
};

// Sweet type labels
export const sweetTypeLabels: Record<Sweet['tipoDoce'], string> = {
  chocolate: '🍫 Chocolates',
  bolo: '🎂 Bolos',
  sobremesa: '🍮 Sobremesas',
  sorvete: '🍦 Sorvetes',
  biscoito: '🍪 Biscoitos',
  fruta_calda: '🍑 Frutas em Calda',
  doce_caseiro: '🍬 Doces Caseiros',
};
