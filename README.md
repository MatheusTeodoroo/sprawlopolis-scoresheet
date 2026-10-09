# Sprawlopolis Scoresheet

Folha de pontuação digital para o jogo de cartas **Sprawlopolis** e suas expansões
(Wrecktar, Points of Interest, Beaches, Construction Zones, Roadwork e Interstate).

Você joga com as cartas físicas, conta na mesa e digita; o site mostra o texto das cartas, faz as contas,
diz se a meta foi batida e guarda o histórico. Nada é sorteado pelo site.

- Cooperativo/solo e competitivo (Interstate, 2 jogadores)
- Dificuldade Normal / Fácil / Difícil
- Histórico, estatísticas e conquistas guardados no navegador (localStorage), com exportar/importar JSON
- Português e inglês, tema claro e escuro
- PWA: instalável e funciona offline

Ferramenta de fãs, sem vínculo com a Button Shy Games. Não inclui a arte do jogo.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local em http://localhost:5173
npm run test     # testes da lógica de pontuação
npm run build    # gera dist/
npm run preview  # serve dist/ (para testar o PWA)
```

Stack: Vite, React, TypeScript, Tailwind CSS, Vitest, vite-plugin-pwa.

| Pasta | Conteúdo |
|---|---|
| `src/data` | Cartas de objetivo, expansões, cartas da Interstate e conquistas (textos PT/EN) |
| `src/lib` | Regras de pontuação, estatísticas e armazenamento, sem dependência de interface |
| `src/components` | Interface |
| `src/i18n` | Textos da interface em PT e EN |

Para adicionar uma carta ou expansão, comece por `src/data` e pela função correspondente em `src/lib/scoring.ts`.

## Publicar na Vercel (grátis)

1. Crie um repositório vazio no GitHub e envie o código:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/sprawlopolis-scoresheet.git
   git push -u origin main
   ```
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório. A Vercel detecta o Vite sozinha
   (build `npm run build`, saída `dist`); é só confirmar.
3. Cada `git push` na branch `main` publica uma nova versão.

O resultado de `npm run build` é um site estático, então também funciona em Netlify, Cloudflare Pages ou GitHub Pages.
