# Felix Copilot

MVP de um copiloto operacional para atendentes de serviÃ§os e assistÃªncia tÃ©cnica. A interface organiza conversas, dados do chamado, sugestÃ£o de resposta e matching de prestadores em um workspace dark inspirado em Chatwoot e Linear.

## O que estÃ¡ implementado

- Inbox de atendimentos com conversas de exemplo baseadas na planilha Seu Felix.
- SugestÃ£o de resposta com variaÃ§Ãµes curta, cordial e objetiva.
- AnÃ¡lise simulada de conversa para validar o fluxo do produto.
- Campos editÃ¡veis com prioridade `AI` e `HUMAN`.
- Upload local de imagens e prÃ©-visualizaÃ§Ã£o do anexo.
- Resumo do chamado.
- Cadastro e busca de prestadores.
- Layout responsivo para operaÃ§Ã£o desktop.

## Executar localmente

Requisitos: Node.js 22+ e pnpm ou npm.

```bash
npm install
npm run dev
```

## Publicar na Vercel

O projeto jÃ¡ inclui uma configuraÃ§Ã£o de build compatÃ­vel com a Vercel. Importe o repositÃ³rio `Keymiuz/SeuFelix` no painel da Vercel e mantenha a pasta raiz como diretÃ³rio do projeto.

O build usado pela Vercel Ã© `npm run build:vercel`. As chaves reais devem ser cadastradas nas variÃ¡veis de ambiente da Vercel; o arquivo `.env.example` contÃ©m apenas valores de exemplo.

Para ativar a leitura real das fotos, cadastre `GEMINI_API_KEY` no ambiente de produÃ§Ã£o da Vercel. Crie a chave no [Google AI Studio](https://aistudio.google.com/apikey). Sem essa chave, a interface entra em modo demonstraÃ§Ã£o para permitir testar o fluxo de preenchimento da ficha.

Para validar produÃ§Ã£o:

```bash
npm run build
npm test
npm run lint
```

## VariÃ¡veis de ambiente

Consulte `.env.example`. A chave da OpenAI deve permanecer somente no backend quando a integraÃ§Ã£o real for adicionada.

## PrÃ³xima etapa de arquitetura

O MVP atual usa estado local para validaÃ§Ã£o da experiÃªncia. A integraÃ§Ã£o de produÃ§Ã£o deve adicionar o backend Spring Boot 3 / Java 21, PostgreSQL, Flyway e a Responses API da OpenAI em trÃªs etapas: extraÃ§Ã£o estruturada, prÃ³xima aÃ§Ã£o e resposta sugerida.

Veja [docs/CHATWOOT_INTEGRATION.md](docs/CHATWOOT_INTEGRATION.md) e [backend/README.md](backend/README.md).

