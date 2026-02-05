
# Plano: Tornar o hint "Ative o som" clicável

## Resumo
Modificar o componente `VSLWithSoundHint` na página `/mapa-dos-beneficios` para que o hint seja clicável. Ao clicar, o som do vídeo será ativado e o hint desaparecerá imediatamente.

---

## Desafio Técnico

O `YouTubeLoopPlayer` atual **não expõe controle externo** do player (como `unMute()`). Para resolver isso, vou:

1. **Modificar o `YouTubeLoopPlayer`** para aceitar um `ref` que exponha o método `unMute()`
2. **Atualizar o `VSLWithSoundHint`** para usar esse ref e ativar o som ao clicar no hint

---

## Alterações

### 1. Arquivo: `src/components/ui/youtube-loop-player.tsx`

**Adicionar suporte a `ref` com `forwardRef` e `useImperativeHandle`:**

```tsx
// Expor interface do ref
export interface YouTubeLoopPlayerRef {
  unMute: () => void;
  mute: () => void;
}

// Interface YTPlayer - adicionar métodos de som
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy: () => void;
  unMute: () => void;  // NOVO
  mute: () => void;    // NOVO
}

// Converter para forwardRef
const YouTubeLoopPlayer = React.forwardRef<YouTubeLoopPlayerRef, YouTubeLoopPlayerProps>(
  ({ videoId, title, ariaLabel, className, style }, ref) => {
    // ... código existente ...

    // Expor métodos via ref
    useImperativeHandle(ref, () => ({
      unMute: () => {
        playerRef.current?.unMute();
        playerRef.current?.playVideo();
      },
      mute: () => {
        playerRef.current?.mute();
      },
    }));

    // ... resto do código ...
  }
);
```

### 2. Arquivo: `src/pages/MapaDosBeneficios.tsx`

**Atualizar `VSLWithSoundHint` para usar o ref e tornar o hint clicável:**

```tsx
import { useRef } from "react";
import YouTubeLoopPlayer, { YouTubeLoopPlayerRef } from "@/components/ui/youtube-loop-player";

const VSLWithSoundHint = ({ videoId, title, ariaLabel, className }) => {
  const [showSoundHint, setShowSoundHint] = useState(true);
  const playerRef = useRef<YouTubeLoopPlayerRef>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSoundHint(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Handler para ativar som (ao clicar no hint)
  const handleActivateSound = () => {
    playerRef.current?.unMute();
    setShowSoundHint(false);
  };

  return (
    <>
      <YouTubeLoopPlayer
        ref={playerRef}  // NOVO: ref para controle
        videoId={videoId}
        title={title}
        ariaLabel={ariaLabel}
        className={className}
      />
      
      <AnimatePresence>
        {showSoundHint && (
          <motion.div
            // ... animações existentes ...
            className="absolute z-20 top-3 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 md:top-4"
            // REMOVIDO: pointer-events-none
          >
            <button
              onClick={handleActivateSound}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-md ring-1 ring-black/5 cursor-pointer hover:bg-white transition-colors"
              aria-label="Ativar som do vídeo"
            >
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              >
                <Volume2 className="h-4 w-4 text-foreground" />
              </motion.span>
              <span className="text-sm font-medium text-foreground">Ative o som</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

---

## Detalhes Técnicos

| Aspecto | Detalhe |
|---------|---------|
| Arquivos alterados | `youtube-loop-player.tsx`, `MapaDosBeneficios.tsx` |
| Padrão usado | `forwardRef` + `useImperativeHandle` para expor API |
| Métodos expostos | `unMute()`, `mute()` |
| Elemento clicável | `<button>` com semântica correta |
| Acessibilidade | `aria-label="Ativar som do vídeo"` |
| Hover state | `hover:bg-white` para feedback visual |

---

## Fluxo de Funcionamento

```text
┌─────────────────────────────────────────────────────────┐
│  Página carrega                                         │
│       ↓                                                 │
│  Vídeo inicia MUDO (autoplay)                          │
│       ↓                                                 │
│  Hint "Ative o som" aparece (fade-in)                  │
│       ↓                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CAMINHO A: Usuário clica no hint               │   │
│  │       ↓                                         │   │
│  │  playerRef.unMute() → Som ativado               │   │
│  │       ↓                                         │   │
│  │  Hint some imediatamente (fade-out)             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CAMINHO B: Usuário não interage                │   │
│  │       ↓                                         │   │
│  │  setTimeout (2.5s)                              │   │
│  │       ↓                                         │   │
│  │  Hint some automaticamente (fade-out)           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Critérios de Aceite

- [ ] Ao abrir `/mapa-dos-beneficios`, o hint aparece sobre o vídeo
- [ ] Clicar no hint ativa o som do vídeo imediatamente
- [ ] Clicar no hint faz o hint desaparecer instantaneamente
- [ ] Se não clicar, o hint some sozinho após 2.5s
- [ ] O ícone continua animando enquanto visível
- [ ] Nenhuma outra rota foi afetada
- [ ] O `YouTubeLoopPlayer` continua funcionando normalmente em outros contextos

---

## Garantias de Escopo

- O player existente não perde funcionalidades
- A API exposta é **opcional** (componentes que não usam ref não são afetados)
- Apenas 2 arquivos são modificados
- Sem novas dependências
