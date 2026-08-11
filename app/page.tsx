"use client";
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type Message = { from: "customer" | "agent" | "system"; text: string; time: string };
type Source = "AI" | "HUMAN";
type TicketFields = {
  customerName: string;
  phone: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
  category: string;
  service: string;
  product: string;
  brand: string;
  model: string;
  problem: string;
  propertyType: string;
  availability: string;
  photosReceived: string;
  warranty: string;
  needsReport: string;
  status: string;
  notes: string;
};

type Conversation = {
  id: string;
  initials: string;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  channel: string;
  accent: string;
  fields: TicketFields;
  messages: Message[];
  sources: Partial<Record<keyof TicketFields, Source>>;
};

type Provider = {
  id: number;
  name: string;
  company: string;
  region: string;
  specialty: string;
  score: number;
  active: boolean;
};

const initialFields: TicketFields = {
  customerName: "Jonatan Ribeiro",
  phone: "(11) 95002-0337",
  cep: "03630-050",
  city: "São Paulo",
  state: "SP",
  neighborhood: "Vila Matilde",
  category: "Eletrodomésticos",
  service: "Manutenção",
  product: "Lavadora de roupas",
  brand: "Electrolux",
  model: "",
  problem: "Equipamento com vazamento de água.",
  propertyType: "Residencial",
  availability: "Horário comercial",
  photosReceived: "Não",
  warranty: "Não informado",
  needsReport: "Não",
  status: "Coletando informações",
  notes: "Cliente chegou pelo WhatsApp. Validar modelo antes de buscar prestador.",
};

const conversationsSeed: Conversation[] = [
  {
    id: "58268",
    initials: "JR",
    name: "Jonatan Ribeiro",
    preview: "Equipamento com vazamento de água.",
    time: "10:42",
    unread: 2,
    channel: "WhatsApp",
    accent: "#4f8cff",
    fields: initialFields,
    sources: { customerName: "AI", cep: "AI", product: "AI", brand: "AI", problem: "AI", propertyType: "HUMAN", availability: "HUMAN" },
    messages: [
      { from: "customer", text: "Oi, minha máquina Electrolux está vazando água por baixo. Vocês conseguem verificar?", time: "10:39" },
      { from: "agent", text: "Oi, Jonatan! Consigo verificar um prestador para esse tipo de atendimento, sim.", time: "10:40" },
      { from: "customer", text: "O CEP é 03630-050. É na minha casa e posso receber em horário comercial.", time: "10:42" },
    ],
  },
  {
    id: "58266",
    initials: "ZE",
    name: "Zeca Oliveira",
    preview: "Instalação do gás no fogão com o kit.",
    time: "09:18",
    channel: "WhatsApp",
    accent: "#d7a24c",
    fields: { ...initialFields, customerName: "Zeca Oliveira", phone: "(11) 96774-5612", cep: "05065-110", city: "São Paulo", neighborhood: "Lapa", category: "Eletrodomésticos", product: "Fogão", brand: "Consul", service: "Instalação", problem: "Instalação do gás no fogão com o kit + conversão.", status: "Pronto para buscar prestador" },
    sources: { customerName: "AI", cep: "AI", product: "AI", brand: "AI", problem: "AI" },
    messages: [{ from: "customer", text: "Preciso instalar o gás no meu fogão Consul e fazer a conversão. CEP 05065-110.", time: "09:17" }, { from: "agent", text: "Entendido! Vou verificar a disponibilidade de um prestador para a instalação.", time: "09:18" }],
  },
  {
    id: "58263",
    initials: "EL",
    name: "Elenildo Souza",
    preview: "Equipamento acusando erro.",
    time: "08:54",
    channel: "Chatwoot",
    accent: "#9c6df5",
    fields: { ...initialFields, customerName: "Elenildo Souza", phone: "(21) 97084-7177", cep: "21070-690", city: "Rio de Janeiro", state: "RJ", neighborhood: "Penha", category: "Climatização", product: "Ar-condicionado split", brand: "Komeco", service: "Manutenção", problem: "Equipamento acusando erro.", propertyType: "Comercial", status: "Procurando prestador" },
    sources: { customerName: "AI", cep: "AI", product: "AI", brand: "AI", problem: "AI" },
    messages: [{ from: "customer", text: "Meu ar-condicionado Komeco está acusando erro e parou de funcionar. CEP 21070-690.", time: "08:53" }],
  },
  {
    id: "58259",
    initials: "CR",
    name: "Cristiano Alves",
    preview: "Equipamento faz barulho.",
    time: "Ontem",
    channel: "Chatwoot",
    accent: "#36b98c",
    fields: { ...initialFields, customerName: "Cristiano Alves", phone: "(13) 99164-6929", cep: "11020-001", city: "Santos", state: "SP", neighborhood: "Gonzaga", product: "Lavadora de roupas", brand: "Electrolux", problem: "Equipamento faz barulho.", status: "Aguardando cliente" },
    sources: { customerName: "AI", cep: "AI", product: "AI", brand: "AI", problem: "AI" },
    messages: [{ from: "customer", text: "A lavadora Electrolux começou a fazer um barulho forte. O que pode ser?", time: "Ontem" }],
  },
];

const providerSeed: Provider[] = [
  { id: 1, name: "Carlos Mendes", company: "Oficina Norte", region: "São Paulo · Zona Leste", specialty: "Lavadoras · Electrolux", score: 95, active: true },
  { id: 2, name: "Marina Costa", company: "Clima Sul", region: "São Paulo · Centro/Sul", specialty: "Ar-condicionado · Komeco", score: 88, active: true },
  { id: 3, name: "Rafael Nunes", company: "Elétrica 24h", region: "São Paulo · Toda a cidade", specialty: "Elétrica · Hidráulica", score: 82, active: true },
  { id: 4, name: "Paulo Vieira", company: "Refrigeração RJ", region: "Rio de Janeiro · Zona Norte", specialty: "Geladeiras · Freezers", score: 78, active: false },
];

const emptyReply = "Entendi! Posso verificar um prestador para esse tipo de atendimento. Para seguir, poderia me informar a marca e o modelo do equipamento, por gentileza?";

function Icon({ children }: { children: string }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

function StatusDot({ color = "#4f8cff" }: { color?: string }) {
  return <span className="status-dot" style={{ background: color }} />;
}

export default function Home() {
  const [activeView, setActiveView] = useState<"inbox" | "providers">("inbox");
  const [conversations, setConversations] = useState(conversationsSeed);
  const [activeId, setActiveId] = useState(conversationsSeed[0].id);
  const [reply, setReply] = useState(emptyReply);
  const [replyMode, setReplyMode] = useState("normal");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(true);
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [providers, setProviders] = useState(providerSeed);
  const [providerSearch, setProviderSearch] = useState("");
  const [showNewProvider, setShowNewProvider] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const activeConversation = conversations.find((item) => item.id === activeId) ?? conversations[0];
  const fields = activeConversation.fields;

  const filteredProviders = useMemo(() => providers.filter((provider) => `${provider.name} ${provider.company} ${provider.specialty} ${provider.region}`.toLowerCase().includes(providerSearch.toLowerCase())), [providers, providerSearch]);

  function selectConversation(id: string) {
    setActiveId(id);
    setAnalysisReady(true);
    setReply(emptyReply);
    setShowSummary(false);
  }

  function updateField(key: keyof TicketFields, value: string) {
    setConversations((current) => current.map((conversation) => conversation.id === activeId ? { ...conversation, fields: { ...conversation.fields, [key]: value }, sources: { ...conversation.sources, [key]: "HUMAN" } } : conversation));
  }

  function analyzeConversation() {
    setIsAnalyzing(true);
    setAnalysisReady(false);
    window.setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisReady(true);
      setReply("Entendi! Posso verificar um prestador para esse atendimento. Você poderia me informar o modelo da máquina, por gentileza? Assim consigo buscar uma opção compatível com a sua região.");
      setConversations((current) => current.map((conversation) => conversation.id === activeId ? { ...conversation, fields: { ...conversation.fields, status: "Coletando informações", notes: "Análise concluída. Falta confirmar o modelo antes do matching." }, sources: { ...conversation.sources, status: "AI", notes: "AI" } } : conversation));
    }, 900);
  }

  function copyReply() {
    navigator.clipboard?.writeText(reply);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function changeReply(mode: string) {
    setReplyMode(mode);
    if (mode === "short") setReply("Pode me informar o modelo da máquina, por favor? Assim verifico um prestador para o atendimento.");
    else if (mode === "cordial") setReply("Entendi, Jonatan! Vou te ajudar com isso. Você poderia me informar, por gentileza, o modelo da máquina? Com essa informação, consigo verificar um prestador para o atendimento.");
    else if (mode === "objective") setReply("Qual é o modelo da máquina? Vou verificar um prestador para a sua região.");
    else setReply(emptyReply);
  }

  function addMessage(event: FormEvent) {
    event.preventDefault();
    if (!messageText.trim()) return;
    setConversations((current) => current.map((conversation) => conversation.id === activeId ? { ...conversation, messages: [...conversation.messages, { from: "agent", text: messageText.trim(), time: "agora" }], preview: messageText.trim() } : conversation));
    setMessageText("");
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setAttachments((current) => [...current, ...files.map((file) => file.name)]);
    updateField("photosReceived", files.length ? "Sim" : fields.photosReceived);
  }

  function createProvider(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "Novo prestador");
    const company = String(form.get("company") || "Empresa parceira");
    setProviders((current) => [{ id: Date.now(), name, company, region: "São Paulo · A definir", specialty: "Aguardando especialidades", score: 0, active: true }, ...current]);
    setShowNewProvider(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">F</div><div><div className="brand-name">Felix</div><div className="brand-sub">Copilot</div></div></div>
        <div className="workspace-switcher"><div className="workspace-avatar">SF</div><div className="workspace-copy"><strong>Seu Felix</strong><span>Operação principal</span></div><span className="chevron">⌄</span></div>
        <nav className="nav-section">
          <button className={`nav-item ${activeView === "inbox" ? "active" : ""}`} onClick={() => setActiveView("inbox")}><Icon>▤</Icon><span>Atendimentos</span><span className="nav-count">12</span></button>
          <button className="nav-item" onClick={() => setActiveView("inbox")}><Icon>◌</Icon><span>Minha fila</span><span className="nav-count muted">4</span></button>
          <button className={`nav-item ${activeView === "providers" ? "active" : ""}`} onClick={() => setActiveView("providers")}><Icon>♧</Icon><span>Prestadores</span></button>
        </nav>
        <div className="nav-label">VISÃO GERAL</div>
        <nav className="nav-section compact">
          <button className="nav-item"><Icon>◒</Icon><span>Dashboard</span></button>
          <button className="nav-item"><Icon>⌁</Icon><span>Relatórios</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="ai-status"><span className="pulse"></span><div><strong>Copilot ativo</strong><span>IA pronta para analisar</span></div></div><button className="user-chip"><span className="user-avatar">DM</span><span>Douglas Lima</span><span className="chevron">⌄</span></button></div>
      </aside>

      {activeView === "providers" ? (
        <section className="content-area providers-page">
          <div className="page-heading"><div><div className="eyebrow">REDE OPERACIONAL</div><h1>Prestadores</h1><p>Gerencie a rede parceira que pode aparecer no matching.</p></div><button className="primary-button" onClick={() => setShowNewProvider(true)}><span>＋</span> Novo prestador</button></div>
          <div className="provider-toolbar"><div className="search-field"><Icon>⌕</Icon><input value={providerSearch} onChange={(e) => setProviderSearch(e.target.value)} placeholder="Buscar por nome, empresa ou especialidade" /></div><button className="filter-button">≡ Filtros <span>3</span></button></div>
          <div className="provider-table"><div className="provider-table-head"><span>PRESTADOR</span><span>COBERTURA</span><span>ESPECIALIDADES</span><span>COMPATIBILIDADE</span><span>STATUS</span><span></span></div>{filteredProviders.map((provider) => <div className="provider-row" key={provider.id}><div className="provider-person"><div className="provider-avatar">{provider.name.split(" ").map((item) => item[0]).join("").slice(0, 2)}</div><div><strong>{provider.name}</strong><span>{provider.company}</span></div></div><span className="cell-copy">{provider.region}</span><span className="cell-copy">{provider.specialty}</span><span className="score"><span className="score-ring">{provider.score}</span>{provider.score ? "% match" : "Novo"}</span><span className={`active-pill ${provider.active ? "on" : "off"}`}><i></i>{provider.active ? "Ativo" : "Inativo"}</span><button className="more-button">•••</button></div>)}</div>
          <div className="provider-footer">{filteredProviders.length} prestadores encontrados <span>·</span> Atualizado há 4 min</div>
          {showNewProvider && <div className="modal-backdrop" onClick={() => setShowNewProvider(false)}><form className="modal-card" onSubmit={createProvider} onClick={(event) => event.stopPropagation()}><div className="modal-title"><div><div className="eyebrow">CADASTRO RÁPIDO</div><h2>Novo prestador</h2></div><button type="button" className="close-button" onClick={() => setShowNewProvider(false)}>×</button></div><label>Nome<input name="name" required placeholder="Ex.: Fernanda Oliveira" /></label><label>Empresa<input name="company" required placeholder="Ex.: Assistência Centro" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowNewProvider(false)}>Cancelar</button><button className="primary-button" type="submit">Salvar prestador</button></div></form></div>}
        </section>
      ) : (
        <section className="content-area">
          <header className="topbar"><div className="breadcrumbs"><span>Atendimentos</span><span className="slash">/</span><strong>Todos os chamados</strong></div><div className="topbar-actions"><button className="icon-button" aria-label="Pesquisar">⌕</button><button className="icon-button" aria-label="Notificações">♢<i></i></button><div className="topbar-divider"></div><button className="help-button">?</button></div></header>
          <div className="inbox-layout">
            <section className="conversation-list-panel">
              <div className="panel-heading"><div><div className="eyebrow">CAIXA DE ENTRADA</div><h1>Atendimentos <span>12</span></h1></div><button className="new-ticket" onClick={() => selectConversation(conversations[0].id)}>＋</button></div>
              <div className="inbox-tabs"><button className="selected">Todos <span>12</span></button><button>Não lidos <span>4</span></button><button>Com IA</button></div>
              <div className="list-filter"><Icon>⌕</Icon><input placeholder="Buscar atendimento" /><span>⌘ K</span></div>
              <div className="conversation-list">{conversations.map((conversation) => <button className={`conversation-row ${conversation.id === activeId ? "selected" : ""}`} key={conversation.id} onClick={() => selectConversation(conversation.id)}><div className="avatar" style={{ background: `${conversation.accent}22`, color: conversation.accent }}>{conversation.initials}</div><div className="conversation-meta"><div className="conversation-name"><strong>{conversation.name}</strong><time>{conversation.time}</time></div><div className="conversation-preview">{conversation.preview}</div><div className="conversation-tags"><span className="channel-tag"><span className="whatsapp-dot">◉</span>{conversation.channel}</span>{conversation.id === activeId && <span className="ai-tag">✦ IA analisou</span>}</div></div>{conversation.unread && <span className="unread-badge">{conversation.unread}</span>}</button>)}</div>
              <div className="list-footer"><span className="live-dot"></span> Sincronizado agora <button>⚙</button></div>
            </section>

            <section className="conversation-panel">
              <div className="conversation-header"><div className="customer-heading"><div className="avatar large" style={{ background: `${activeConversation.accent}22`, color: activeConversation.accent }}>{activeConversation.initials}</div><div><h2>{activeConversation.name}</h2><div className="customer-sub"><span className="online-dot"></span> WhatsApp <span>·</span> chamado #{activeConversation.id}</div></div></div><div className="conversation-header-actions"><span className="status-chip"><StatusDot color="#d7a24c" />{fields.status}</span><button className="icon-button">•••</button></div></div>
              <div className="conversation-thread"><div className="date-separator"><span>Hoje</span></div>{activeConversation.messages.map((message, index) => <div className={`message-row ${message.from}`} key={`${message.time}-${index}`}>{message.from === "customer" && <div className="mini-avatar" style={{ background: `${activeConversation.accent}22`, color: activeConversation.accent }}>{activeConversation.initials}</div>}<div className="message-stack"><div className="message-author">{message.from === "customer" ? activeConversation.name.split(" ")[0] : message.from === "agent" ? "Você" : "Sistema"}<time>{message.time}</time></div><div className="message-bubble">{message.text}</div></div>{message.from === "agent" && <div className="mini-avatar agent-avatar">DM</div>}</div>)}{attachments.length > 0 && <div className="attachment-preview"><div className="attachment-icon">▧</div><div><strong>{attachments.length} arquivo(s) anexado(s)</strong><span>{attachments.join(", ")}</span></div></div>}</div>
              <div className="composer"><div className="composer-tools"><label className="attach-button" title="Anexar imagem"><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleFiles} />⌕</label><button type="button">☺</button><button type="button">@</button><span className="composer-hint">Cole uma conversa, escreva uma mensagem ou anexe um print</span></div><form onSubmit={addMessage}><textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Escreva uma mensagem para o cliente..." rows={2} /><div className="composer-bottom"><span>Enter para enviar · Shift + Enter para nova linha</span><button className="send-button" type="submit">Enviar <span>↗</span></button></div></form></div>
            </section>

            <aside className="copilot-panel">
              <div className="copilot-header"><div><div className="copilot-title"><span className="sparkle">✦</span> Felix Copilot</div><p>Assistência inteligente para seu atendimento</p></div><span className="beta-pill">BETA</span></div>
              <div className="copilot-scroll">
                <div className="analysis-card"><div className="card-label-row"><span className="section-label">RESPOSTA SUGERIDA</span><span className="confidence"><span className="confidence-dot"></span>{analysisReady ? "96% confiança" : "analisando..."}</span></div>{isAnalyzing ? <div className="thinking"><span></span><span></span><span></span><em>Entendendo a conversa...</em></div> : <div className="suggested-reply">{reply}</div>}<div className="reply-actions"><button className="copy-button" onClick={copyReply}>▣ {copied ? "Copiado" : "Copiar"}</button><button onClick={analyzeConversation} disabled={isAnalyzing}>↻ Gerar novamente</button></div><div className="tone-actions"><button className={replyMode === "short" ? "selected" : ""} onClick={() => changeReply("short")}>Mais curta</button><button className={replyMode === "cordial" ? "selected" : ""} onClick={() => changeReply("cordial")}>Mais cordial</button><button className={replyMode === "objective" ? "selected" : ""} onClick={() => changeReply("objective")}>Objetiva</button></div></div>
                <button className="analyze-button" onClick={analyzeConversation} disabled={isAnalyzing}><span className="analyze-sparkle">✦</span>{isAnalyzing ? "Analisando conversa..." : "Analisar conversa"}<span className="shortcut">⌘ ↵</span></button>
                <div className="next-action-card"><div className="card-label-row"><span className="section-label">PRÓXIMA AÇÃO</span><span className="action-badge">ASK_MODEL</span></div><strong>Pedir o modelo da máquina</strong><p>O produto e a marca já estão identificados. O modelo ajuda a buscar um prestador compatível.</p></div>
                <div className="missing-card"><div className="section-label">INFORMAÇÕES FALTANTES <span>1</span></div><div className="missing-item"><span className="missing-icon">○</span><span>Modelo do equipamento</span><span className="required">necessário</span></div><div className="complete-item"><span>✓</span><span>CEP e região</span><em>confirmado</em></div><div className="complete-item"><span>✓</span><span>Problema relatado</span><em>confirmado</em></div></div>
                <div className="copilot-note"><span>⌁</span><p>A sugestão é apenas um rascunho. Revise antes de enviar ao cliente.</p></div>
              </div>
            </aside>

            <aside className="ticket-panel">
              <div className="ticket-header"><div><div className="eyebrow">DADOS DO CHAMADO</div><h2>Ficha de atendimento</h2></div><button className="icon-button">•••</button></div>
              <div className="ticket-scroll"><div className="ticket-summary"><div className="summary-avatar">{activeConversation.initials}</div><div><strong>{fields.customerName || "Cliente sem nome"}</strong><span>Chamado #{activeConversation.id}</span></div><span className="source-pill"><span className="source-dot"></span> AI</span></div><div className="field-section"><div className="field-section-title">CLIENTE <span>⌃</span></div><EditableField label="Nome do cliente" value={fields.customerName} source={activeConversation.sources.customerName} onChange={(value) => updateField("customerName", value)} /><EditableField label="Telefone" value={fields.phone} source="AI" onChange={(value) => updateField("phone", value)} /><div className="field-grid"><EditableField label="CEP" value={fields.cep} source={activeConversation.sources.cep} onChange={(value) => updateField("cep", value)} /><EditableField label="Cidade" value={fields.city} source="AI" onChange={(value) => updateField("city", value)} /></div><div className="field-grid"><EditableField label="Estado" value={fields.state} source="AI" onChange={(value) => updateField("state", value)} /><EditableField label="Bairro" value={fields.neighborhood} source="AI" onChange={(value) => updateField("neighborhood", value)} /></div></div><div className="field-section"><div className="field-section-title">SERVIÇO <span>⌃</span></div><div className="field-grid"><EditableField label="Categoria" value={fields.category} source="AI" onChange={(value) => updateField("category", value)} /><EditableField label="Serviço" value={fields.service} source="AI" onChange={(value) => updateField("service", value)} /></div><EditableField label="Produto" value={fields.product} source={activeConversation.sources.product} onChange={(value) => updateField("product", value)} /><div className="field-grid"><EditableField label="Marca" value={fields.brand} source={activeConversation.sources.brand} onChange={(value) => updateField("brand", value)} /><EditableField label="Modelo" value={fields.model} source={activeConversation.sources.model} onChange={(value) => updateField("model", value)} placeholder="Não informado" /></div><EditableField label="Problema relatado" value={fields.problem} source={activeConversation.sources.problem} onChange={(value) => updateField("problem", value)} multiline /></div><div className="field-section"><div className="field-section-title">CONTEXTO <span>⌃</span></div><div className="field-grid"><EditableField label="Tipo de imóvel" value={fields.propertyType} source={activeConversation.sources.propertyType} onChange={(value) => updateField("propertyType", value)} /><EditableField label="Disponibilidade" value={fields.availability} source={activeConversation.sources.availability} onChange={(value) => updateField("availability", value)} /></div><div className="field-grid"><EditableField label="Foto recebida" value={fields.photosReceived} source="AI" onChange={(value) => updateField("photosReceived", value)} /><EditableField label="Garantia" value={fields.warranty} source="AI" onChange={(value) => updateField("warranty", value)} /></div><div className="field-grid"><EditableField label="Precisa de laudo" value={fields.needsReport} source="AI" onChange={(value) => updateField("needsReport", value)} /><EditableField label="Status" value={fields.status} source={activeConversation.sources.status} onChange={(value) => updateField("status", value)} /></div><EditableField label="Observações" value={fields.notes} source={activeConversation.sources.notes} onChange={(value) => updateField("notes", value)} multiline /></div><div className="ticket-footer-actions"><button className="secondary-button" onClick={() => setShowSummary(true)}>▤ Gerar resumo</button><button className="primary-button" onClick={() => setActiveView("providers")}>♧ Buscar prestadores</button></div></div>
              {showSummary && <div className="summary-drawer"><div className="summary-drawer-head"><strong>Resumo do chamado</strong><button onClick={() => setShowSummary(false)}>×</button></div><p><strong>{fields.customerName}</strong> solicita avaliação de <strong>{fields.product.toLowerCase()}</strong> {fields.brand && `da marca ${fields.brand.toLowerCase()}`}, relatando que {fields.problem.toLowerCase()}</p><div className="summary-status"><StatusDot color="#4f8cff" />{fields.status}</div></div>}
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}

function EditableField({ label, value, source, onChange, multiline = false, placeholder = "Não informado" }: { label: string; value: string; source?: Source; onChange: (value: string) => void; multiline?: boolean; placeholder?: string }) {
  return <label className={`editable-field ${multiline ? "full-field" : ""}`}><span className="field-label">{label}<small className={source === "HUMAN" ? "human" : "ai"}>{source ?? "AI"}</small></span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={2} /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}</label>;
}