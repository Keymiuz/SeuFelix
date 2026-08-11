# Integração futura com Chatwoot

O MVP mantém a origem da conversa desacoplada para que o inbox manual seja substituído por um adaptador de Chatwoot quando a integração for autorizada.

## Contrato sugerido

```ts
export interface ConversationSourceAdapter {
  listConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation>;
  sendMessage(id: string, body: string): Promise<void>;
}
```

`ManualConversationSource` é a implementação atual, baseada em dados locais. Uma futura `ChatwootConversationSource` deverá mapear mensagens para `customer`, `agent` e `system`, ignorando eventos operacionais como mudança de prioridade, atribuição e mudança de status.

As credenciais do Chatwoot e da OpenAI devem permanecer somente no backend.