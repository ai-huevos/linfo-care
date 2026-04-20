import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, Paperclip } from 'lucide-react';
import { useAuth } from '../lib/auth';

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: `¡Hola! Soy **Doctora Lío**, tu asistente de cuidado para Roro. 💙

Puedo ayudarte con:
• **Preguntas médicas** — "¿Qué significa que la LDH esté tan alta?"
• **Documentos** — "Acabo de recibir los resultados de laboratorio"  
• **Turnos** — "¿Quién está mañana en la tarde?"
• **Resúmenes** — "Dame el resumen del día para WhatsApp"
• **Cuidados** — "¿Qué enjuague bucal le hacemos hoy?"

¿En qué te puedo ayudar?`,
  },
];

// Fallback local responses when API is unavailable
function generateLocalResponse(input) {
  const lower = input.toLowerCase();

  if (lower.includes('suv') || lower.includes('pet')) {
    return `El **SUVmax de 26.7** de Roro es muy alto. Para contexto:\n\n• Normal: < 2\n• Inflamación/infección: 3-5\n• Linfoma agresivo: > 5\n• **Roro: 26.7** — indica enfermedad muy activa\n\nEsto no es bueno ni malo por sí solo — es una medida de qué tan activo está el linfoma. La buena noticia: los linfomas con SUV alto a menudo **responden bien** a la quimioterapia.\n\n**Pregunta para el equipo:** "¿El PET intermedio (después del ciclo 2 o 4) va a mostrar si el SUV está bajando?"`;
  }

  if (lower.includes('rchop') || lower.includes('r-chop') || lower.includes('quimio') || lower.includes('chop')) {
    return `**R-CHOP** es el régimen estándar para DLBCL. Cada letra es un medicamento:\n\n• **R** — Rituximab: anticuerpo contra CD20 (inmunoterapia)\n• **C** — Ciclofosfamida: destruye el ADN del tumor\n• **H** — Doxorrubicina (Hidroxidaunorubicina): antibiótico antitumoral\n• **O** — Vincristina (Oncovin): frena la división celular\n• **P** — Prednisona: reduce inflamación, ayuda a los otros\n\nPara Roro, dado su edad (78) y fragilidad, el equipo podría optar por **R-mini-CHOP** (dosis reducidas ~50%), que tiene menos toxicidad con resultados razonables en pacientes mayores.\n\n**Riesgos principales:**\n• Neutropenia febril (día 7-14)\n• Cardiotoxicidad (por doxorrubicina)\n• Síndrome de lisis tumoral\n• Mucositis oral\n\n**Pregunta para oncología:** "¿Van con R-CHOP completo o R-mini-CHOP, y por qué?"`;
  }

  if (lower.includes('enjuague') || lower.includes('boca') || lower.includes('bucal')) {
    return `**Enjuague bucal recomendado para hoy:**\n\n**1. El fundamental — bicarbonato + sal** (4-6 veces al día)\n• 250 ml agua tibia hervida\n• ½ cucharadita bicarbonato\n• ½ cucharadita sal refinada\n• Enjuagar 30 seg, escupir\n\n**2. Manzanilla** (2-3 veces al día como complemento)\n• 1 bolsita en 250 ml agua hervida\n• Dejar enfriar completamente\n• Enjuagar 30 seg\n\n**Evitar:** Listerine con alcohol, cepillos duros, limón directo.\n\n**Importante:** Revisar lengua y mucosas buscando placas blancas, úlceras o sangrado. Si aparece alguno, avisar a enfermería.`;
  }

  return `Gracias por tu pregunta. Estoy procesando la información.\n\n💡 **Tip:** Para activar las respuestas de IA en tiempo real, se necesita configurar la API key en Vercel.\n\nMientras tanto, puedo ayudarte con:\n• **Términos médicos** — explico qué significan los resultados\n• **Cuidados diarios** — enjuagues, nutrición, prevención\n• **Organización familiar** — turnos, inventario, resúmenes\n\n¿Podrías ser más específico sobre qué necesitas saber?`;
}

export default function Chat() {
  const { displayName } = useAuth();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Prepare API messages (skip the initial welcome)
    const apiMessages = updatedMessages
      .filter((_, i) => i > 0) // skip initial welcome
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Streaming response from Vercel AI SDK
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Add empty assistant message for streaming
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse AI SDK data stream format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Text chunk
              try {
                const text = JSON.parse(line.slice(2));
                assistantContent += text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      console.log('AI Gateway unavailable, using local response:', error.message);
      // Fallback to local responses
      const assistantMsg = {
        role: 'assistant',
        content: generateLocalResponse(userMsg.content),
      };
      setMessages(prev => {
        // Remove empty streaming message if it was added
        const cleaned = prev.filter(m => m.content !== '');
        return [...cleaned, assistantMsg];
      });
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    '¿Qué significa SUVmax de 26.7?',
    '¿Cuáles son los riesgos del R-CHOP?',
    '¿Qué enjuague bucal le hacemos?',
    'Resumen del día para WhatsApp',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-serif font-normal text-stone-900 flex items-center gap-2">
            Doctora Lío
            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-sans font-bold">AI</span>
          </h1>
          <p className="text-xs text-stone-500">Asistente de cuidado familiar</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} displayName={displayName} />
        ))}

        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-none">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                <span className="text-sm text-stone-500">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
              className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-stone-200 pt-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              rows={1}
              className="w-full px-4 py-3 pr-12 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              className="absolute right-2 bottom-2 p-1.5 text-stone-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              title="Adjuntar archivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-2 text-center">
          Doctora Lío no reemplaza al equipo médico. Siempre confirma con los doctores.
        </p>
      </div>
    </div>
  );
}

function ChatBubble({ message, displayName }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none ${
        isUser
          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
          : 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
      }`}>
        {isUser
          ? <span className="text-white text-xs font-bold">{displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-md'
          : 'bg-white border border-stone-200 text-stone-800 rounded-tl-md'
      }`}>
        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? '' : 'prose prose-sm prose-stone max-w-none'}`}>
          <FormattedText text={message.content} isUser={isUser} />
        </div>
      </div>
    </div>
  );
}

function FormattedText({ text, isUser }) {
  if (isUser) return text;
  if (!text) return <span className="text-stone-400">...</span>;

  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-stone-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (line.startsWith('• ') || line.startsWith('- ')) {
      return <div key={i} className="flex items-start gap-2 mt-1"><span className="text-violet-400 flex-none">•</span><span>{formatted.map((f, k) => typeof f === 'string' ? f.replace(/^[•-]\s*/, '') : f)}</span></div>;
    }

    return <div key={i} className={i > 0 ? 'mt-1.5' : ''}>{formatted}</div>;
  });
}
