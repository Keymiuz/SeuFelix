# IntegraÃ§Ã£o futura com Chatwoot

O MVP mantÃ©m a origem da conversa desacoplada para que o inbox manual seja substituÃ­do por um adaptador de Chatwoot quando a integraÃ§Ã£o for autorizada.

## Contrato sugerido

```ts
export interface ConversationSourceAdapter {
  listConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation>;
  sendMessage(id: string, body: string): Promise<void>;
}
```

`ManualConversationSource` Ã© a implementaÃ§Ã£o atual, baseada em dados locais. Uma futura `ChatwootConversationSource` deverÃ¡ mapear mensagens para `customer`, `agent` e `system`, ignorando eventos operacionais como mudanÃ§a de prioridade, atribuiÃ§Ã£o e mudanÃ§a de status.

As credenciais do Chatwoot e da OpenAI devem permanecer somente no backend.
