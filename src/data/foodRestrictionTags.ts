 // Map of standard food IDs to restriction tags
 // This helps match foods to dietary restrictions beyond just the food name
 export const foodRestrictionTags: Record<string, string[]> = {
   // =================== PROTEÍNAS ===================
   // Carnes
   'p1': ['frango', 'carne', 'origem animal'], // Frango Grelhado
   'p3': ['carne', 'bovina', 'carne vermelha', 'origem animal'], // Carne Bovina Magra
   'p13': ['porco', 'suino', 'carne', 'origem animal'], // Carne de Porco Magra
   'p14': ['carne', 'bovina', 'carne vermelha', 'origem animal'], // Patinho Bovino
   'p15': ['frango', 'carne', 'origem animal'], // Frango Desfiado
   'p20': ['porco', 'suino', 'lombo', 'carne', 'origem animal'], // Lombo Suíno
   'p6': ['frango', 'peru', 'carne', 'origem animal'], // Peito de Peru
   
   // Peixes e frutos do mar
   'p4': ['peixe', 'tilapia', 'origem animal'], // Tilápia Grelhada
   'p5': ['peixe', 'atum', 'origem animal'], // Atum em Conserva
   'p10': ['peixe', 'salmao', 'origem animal'], // Salmão Grelhado
   'p11': ['camarao', 'crustaceo', 'marisco', 'origem animal'], // Camarão Cozido
   'p16': ['peixe', 'sardinha', 'origem animal'], // Sardinha em Conserva
   'p18': ['peixe', 'bacalhau', 'origem animal'], // Bacalhau Desfiado
   
   // Ovos
   'p2': ['ovo', 'origem animal'], // Ovo Inteiro Cozido
   'p19': ['ovo', 'clara', 'origem animal'], // Clara de Ovo
   
   // Whey e suplementos com leite
   'p9': ['whey', 'leite', 'lactose', 'laticinio', 'origem animal'], // Whey Protein
   
   // Soja
   'p12': ['tofu', 'soja'], // Tofu Firme
   
   // =================== GRÃOS ===================
   // Glúten
   'gr6': ['pao', 'gluten', 'trigo'], // Pão Integral
   'gr7': ['pao', 'gluten', 'trigo'], // Pão Francês
   'gr8': ['macarrao', 'massa', 'gluten', 'trigo'], // Macarrão Integral
   'gr5': ['aveia', 'gluten'], // Aveia em Flocos (pode ter contaminação)
   'gr18': ['granola', 'gluten', 'aveia'], // Granola
   
   // Açúcar
   'gr19': ['mel', 'acucar', 'origem animal'], // Mel
   
   // =================== LATICÍNIOS ===================
   'lc1': ['queijo', 'leite', 'lactose', 'laticinio', 'origem animal'], // Queijo Cottage
   'lc2': ['iogurte', 'leite', 'lactose', 'laticinio', 'origem animal'], // Iogurte Grego Natural
   'lc3': ['queijo', 'leite', 'lactose', 'laticinio', 'origem animal'], // Queijo Minas Frescal
   'lc4': ['ricota', 'queijo', 'leite', 'lactose', 'laticinio', 'origem animal'], // Ricota
   'lc5': ['leite', 'lactose', 'laticinio', 'origem animal'], // Leite Integral
   'lc6': ['leite', 'lactose', 'laticinio', 'origem animal'], // Leite Desnatado
   'lc7': ['iogurte', 'leite', 'lactose', 'laticinio', 'origem animal'], // Iogurte Natural
   'lc8': ['queijo', 'mucarela', 'leite', 'lactose', 'laticinio', 'origem animal'], // Queijo Muçarela
   'lc9': ['requeijao', 'queijo', 'leite', 'lactose', 'laticinio', 'origem animal'], // Requeijão
   'lc10': ['cream cheese', 'queijo', 'leite', 'lactose', 'laticinio', 'origem animal'], // Cream Cheese Light
   
   // =================== OLEAGINOSAS ===================
   'ol3': ['castanha', 'castanhas', 'nozes'], // Castanha do Pará
   'ol4': ['amendoim'], // Amendoim Torrado
   'ol5': ['amendoim', 'pasta de amendoim'], // Pasta de Amendoim
   'ol8': ['nozes', 'castanhas'], // Nozes
   'ol9': ['amendoas', 'castanhas'], // Amêndoas
   'ol11': ['manteiga', 'leite', 'lactose', 'laticinio', 'origem animal'], // Manteiga
   
   // =================== BEBIDAS ===================
   // Cafeína
   'b5': ['cafe', 'cafeina', 'espresso'], // Café Preto (Espresso)
   'b6': ['cafe', 'cafeina', 'leite', 'lactose', 'laticinio', 'origem animal'], // Café com Leite
   'b7': ['cafe', 'cafeina', 'cappuccino', 'leite', 'lactose', 'laticinio', 'origem animal'], // Cappuccino
   'b8': ['cafe', 'cafeina', 'acucar'], // Café com Açúcar
   'b9': ['cha', 'cafeina'], // Chá Verde
   'b10': ['cha', 'cafeina'], // Chá Preto
   
   // Leite nas bebidas
   'b13': ['leite', 'lactose', 'laticinio', 'acucar', 'origem animal'], // Leite com Chocolate
   'b14': ['leite', 'lactose', 'laticinio', 'acucar', 'origem animal'], // Achocolatado
   'b15': ['leite', 'lactose', 'laticinio', 'vitamina', 'origem animal'], // Vitamina de Banana
   'b16': ['leite', 'lactose', 'laticinio', 'vitamina', 'acucar', 'origem animal'], // Vitamina de Morango
   'b17': ['leite', 'lactose', 'laticinio', 'vitamina', 'origem animal'], // Vitamina de Mamão
   'b24': ['leite', 'lactose', 'laticinio', 'origem animal'], // Leite Desnatado
   'b25': ['leite', 'lactose', 'laticinio', 'origem animal'], // Leite com Aveia
   
   // Refrigerantes e doces líquidos (açúcar)
   'b18': ['refrigerante', 'acucar'], // Refrigerante Cola
   'b19': ['refrigerante', 'acucar'], // Refrigerante Laranja
   'b20': ['refrigerante', 'acucar'], // Refrigerante Limão
   
   // =================== DOCES ===================
   // Chocolate e derivados
   'd1': ['chocolate', 'acucar', 'leite', 'lactose', 'laticinio', 'origem animal'], // Chocolate ao Leite
   'd2': ['chocolate', 'acucar'], // Chocolate Amargo 70%
   'd3': ['brownie', 'chocolate', 'acucar', 'ovo', 'leite', 'gluten', 'origem animal'], // Brownie
   'd5': ['trufa', 'chocolate', 'acucar', 'leite', 'origem animal'], // Trufa de Chocolate
   'd8': ['mousse', 'chocolate', 'acucar', 'leite', 'ovo', 'origem animal'], // Mousse de Chocolate
   'd10': ['chocolate', 'acucar'], // Chocolate 85% Cacau
   'd13': ['bombom', 'chocolate', 'acucar', 'leite', 'origem animal'], // Bombom Recheado
   'd16': ['trufa', 'chocolate', 'acucar', 'origem animal'], // Trufa Vegana
   'd18': ['brownie', 'chocolate', 'acucar', 'gluten', 'origem animal'], // Brownie Fit
   
   // Sorvete
   'd4': ['sorvete', 'acucar', 'leite', 'lactose', 'laticinio', 'origem animal'], // Sorvete de Baunilha
   'd6': ['picole', 'acucar'], // Picolé de Fruta
   'd9': ['sorvete', 'acucar', 'leite', 'lactose', 'laticinio', 'origem animal'], // Sorvete de Morango
   'd20': ['acai', 'acucar'], // Açaí sem Guaraná
   'd21': ['sorvete', 'acai', 'acucar'], // Frozen Yogurt
   
   // Bolos e tortas
   'd7': ['bolo', 'acucar', 'ovo', 'leite', 'gluten', 'origem animal'], // Bolo Caseiro
   'd12': ['torta', 'acucar', 'ovo', 'leite', 'gluten', 'origem animal'], // Torta de Limão
   'd14': ['bolo', 'acucar', 'ovo', 'leite', 'gluten', 'origem animal'], // Bolo de Cenoura
   'd15': ['bolo', 'acucar', 'ovo', 'leite', 'gluten', 'origem animal'], // Bolo de Chocolate
   
   // Pudins e doces de colher
   'd11': ['pudim', 'acucar', 'leite', 'ovo', 'origem animal'], // Pudim de Leite
   'd17': ['mousse', 'acucar'], // Mousse de Maracujá
   'd19': ['gelatina', 'acucar'], // Gelatina Diet
 };