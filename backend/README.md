# Backend Felix Copilot

O frontend atual usa dados locais para permitir validaÃ§Ã£o da experiÃªncia sem credenciais externas. O backend planejado deve ser implementado em Spring Boot 3 + Java 21, com PostgreSQL, Flyway e a Responses API da OpenAI.

Camadas previstas: `controller`, `service`, `repository`, `domain`, `dto`, `ai`, `provider`, `config` e `exception`.

O contrato de IA estÃ¡ separado em trÃªs etapas: extraÃ§Ã£o estruturada, prÃ³xima aÃ§Ã£o e resposta sugerida. Campos editados pelo atendente devem ser marcados como `HUMAN` e nunca sobrescritos por uma nova anÃ¡lise automÃ¡tica.
