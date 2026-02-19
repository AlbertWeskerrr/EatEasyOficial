import { useEffect, useState } from 'react';

interface WelcomeOverlayProps {
  nome: string;
  sexo: 'masculino' | 'feminino' | 'outro';
}

const mensagensMulher = [
  "Olá, Diva! 👑 Vamos criar seu plano alimentar perfeito?",
  "Oi, Linda! ✨ Sua nutrição está em boas mãos!",
  "Amiga! 💪 Vamos nessa juntas? Seu plano está pronto!",
  "E aí, Rainha? 👸 Vamos ao trabalho!",
  "Opa, Gata! 🔥 Seu plano alimentar personalizado aguarda!",
  "Linda! 💄 Vamos conquistar seus objetivos?",
  "Salve, Diva! 🌟 Seu plano está pronto para bombar!",
  "Amiga, vem cá! 💖 Vamos transformar sua nutrição?",
];

const mensagensHomem = [
  "E aí, {NOME}! 💪 Vamos com tudo?",
  "Guerreiro! ⚔️ {NOME}, seu plano está pronto!",
  "Fera, {NOME}! 🐯 Vamos bombar?",
  "{NOME}, tudo certo? 🎯 Seu plano alimentar foi criado!",
  "Opa, {NOME}! 🔥 Vamos conquistar seus objetivos?",
  "E aí, meu bom! 👊 {NOME}, sua nutrição está em boas mãos!",
  "Salve, {NOME}! 💪 Vamos transformar sua saúde?",
  "Bora, {NOME}! 🚀 Seu plano alimentar aguarda!",
];

const mensagensOutro = [
  "Ótimo dia, {NOME}! 🌟 Vamos com tudo?",
  "{NOME}, perfeito! 🚀 Vamos conquistar seus objetivos!",
  "Salve, {NOME}! 💙 Seu plano está pronto!",
  "{NOME}! 🌈 Vamos transformar sua nutrição?",
  "E aí, {NOME}? 🎯 Vamos bombar juntos!",
  "{NOME}, bem-vindo! ✨ Seu plano alimentar personalizado aguarda!",
  "Opa, {NOME}! 💪 Vamos com tudo?",
  "{NOME}, que legal! 🎉 Seu plano foi criado!",
];

export function WelcomeOverlay({ nome, sexo }: WelcomeOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mensagens: string[];
    
    if (sexo === 'feminino') {
      mensagens = mensagensMulher;
    } else if (sexo === 'masculino') {
      mensagens = mensagensHomem;
    } else {
      mensagens = mensagensOutro;
    }
    
    const randomIndex = Math.floor(Math.random() * mensagens.length);
    const selectedMessage = mensagens[randomIndex].replace(/{NOME}/g, nome);
    setMessage(selectedMessage);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [nome, sexo]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-card text-card-foreground rounded-3xl shadow-2xl p-8 md:p-12 mx-4 max-w-lg text-center animate-scale-in border border-border">
        <div className="text-5xl md:text-6xl mb-6">🎉</div>
        <p className="text-2xl md:text-3xl font-bold leading-relaxed">
          {message}
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
