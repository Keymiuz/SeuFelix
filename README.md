# Felix Copilot

MVP de um copiloto operacional para atendentes de serviços e assistência técnica. A interface organiza conversas, dados do chamado, sugestão de resposta e matching de prestadores em um workspace dark inspirado em Chatwoot e Linear.

## O que está implementado

- Inbox de atendimentos com conversas de exemplo baseadas na planilha Seu Felix.
- Sugestão de resposta com variações curta, cordial e objetiva.
- Análise simulada de conversa para validar o fluxo do produto.
- Campos editáveis com prioridade `AI` e `HUMAN`.
- Upload local de imagens e pré-visualização do anexo.
- Resumo do chamado.
- Cadastro e busca de prestadores.
- Layout responsivo para operação desktop.

## Executar localmente

Requisitos: Node.js 22+ e pnpm ou npm.

```bash
npm install
npm run dev
```

Para validar produção:

```bash
npm run build
npm test
npm run lint
```

## Variáveis de ambiente

Consulte `.env.example`. A chave da OpenAI deve permanecer somente no backend quando a integração real for adicionada.

## Próxima etapa de arquitetura

O MVP atual usa estado local para validação da experiência. A integração de produção deve adicionar o backend Spring Boot 3 / Java 21, PostgreSQL, Flyway e a Responses API da OpenAI em três etapas: extração estruturada, próxima ação e resposta sugerida.

Veja [docs/CHATWOOT_INTEGRATION.md](docs/CHATWOOT_INTEGRATION.md) e [backend/README.md](backend/README.md).
