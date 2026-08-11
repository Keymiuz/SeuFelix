"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

type Source = "AI" | "HUMAN";
type TicketKey =
  | "customerName"
  | "phone"
  | "cep"
  | "city"
  | "state"
  | "neighborhood"
  | "category"
  | "service"
  | "product"
  | "brand"
  | "model"
  | "problem"
  | "propertyType"
  | "availability"
  | "photosReceived"
  | "warranty"
  | "needsReport"
  | "status"
  | "notes";

type TicketFields = Record<TicketKey, string>;
type Provider = { name: string; company: string; email: string; region: string; phone: string; cep: string; categories: string[] };

const emptyFields: TicketFields = {
  customerName: "",
  phone: "",
  cep: "",
  city: "",
  state: "",
  neighborhood: "",
  category: "",
  service: "",
  product: "",
  brand: "",
  model: "",
  problem: "",
  propertyType: "",
  availability: "",
  photosReceived: "Sim",
  warranty: "",
  needsReport: "NÃ£o",
  status: "Revisar ficha",
  notes: "",
};

const demoFields: TicketFields = {
  customerName: "Jonatan Ribeiro",
  phone: "(11) 95002-0337",
  cep: "03630-050",
  city: "SÃ£o Paulo",
  state: "SP",
  neighborhood: "Vila Matilde",
  category: "EletrodomÃ©sticos",
  service: "ManutenÃ§Ã£o",
  product: "Lavadora de roupas",
  brand: "Electrolux",
  model: "LFE11",
  problem: "Equipamento com vazamento de Ã¡gua por baixo.",
  propertyType: "Residencial",
  availability: "HorÃ¡rio comercial",
  photosReceived: "Sim",
  warranty: "NÃ£o informado",
  needsReport: "NÃ£o",
  status: "Revisar ficha",
  notes: "Dados extraÃ­dos da foto. Confirme o modelo e o endereÃ§o antes de encaminhar.",
};

const ticketLabels: Record<TicketKey, string> = {
  customerName: "Nome do cliente",
  phone: "Telefone",
  cep: "CEP",
  city: "Cidade",
  state: "Estado",
  neighborhood: "Bairro",
  category: "Categoria",
  service: "ServiÃ§o",
  product: "Produto",
  brand: "Marca",
  model: "Modelo",
  problem: "Problema relatado",
  propertyType: "Tipo de imÃ³vel",
  availability: "Disponibilidade",
  photosReceived: "Foto recebida",
  warranty: "Garantia",
  needsReport: "Precisa de laudo",
  status: "Status",
  notes: "ObservaÃ§Ãµes",
};

const fieldGroups: { title: string; fields: TicketKey[] }[] = [
  { title: "CLIENTE", fields: ["customerName", "phone", "cep", "city", "state", "neighborhood"] },
  { title: "SERVIÃ‡O", fields: ["category", "service", "product", "brand", "model", "problem"] },
  { title: "CONTEXTO", fields: ["propertyType", "availability", "photosReceived", "warranty", "needsReport", "status", "notes"] },
];

function Icon({ children }: { children: string }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

function SourcePill({ source }: { source?: Source }) {
  return <small className={`source-mini ${source === "HUMAN" ? "human" : "ai"}`}>{source === "HUMAN" ? "VOCÃŠ" : "IA"}</small>;
}

function EditableField({
  field,
  value,
  source,
  multiline,
  onChange,
}: {
  field: TicketKey;
  value: string;
  source?: Source;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={`editable-field ${multiline ? "full-field" : ""}`}>
      <span className="field-label">{ticketLabels[field]} <SourcePill source={source} /></span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} placeholder="Aguardando leitura" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Aguardando leitura" />
      )}
    </label>
  );
}

function ProviderRecommendations({ providers, fields, status, onIndicate }: { providers: Provider[]; fields: TicketFields; status: string; onIndicate: (provider: Provider) => void }) {
  if (status !== "ready" && status !== "demo") return null;
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const product = normalize(fields.product);
  const matches = providers.map((provider) => {
    const productMatch = product && provider.categories.some((category) => normalize(category).includes(product) || product.includes(normalize(category)));
    const regionMatch = fields.state && provider.region === fields.state.toUpperCase();
    return { provider, score: (productMatch ? 2 : 0) + (regionMatch ? 1 : 0) };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.provider);
  return <div className="provider-recommendations"><div className="section-label">PRESTADORES INDICADOS</div>{matches.length ? matches.map((provider) => <div className="provider-card" key={`${provider.name}-${provider.company}`}><div className="provider-avatar">{provider.name.slice(0, 1).toUpperCase()}</div><div><strong>{provider.name}</strong><span>{provider.company} Â· {provider.region}</span><small>{provider.phone || provider.email}</small></div><button className="provider-action" onClick={() => onIndicate(provider)}>Indicar</button></div>) : <p className="provider-empty">Nenhum prestador compatÃ­vel encontrado.</p>}</div>;
}

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSize = 1600;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("NÃ£o foi possÃ­vel ler esta imagem."));
    };
    image.src = objectUrl;
  });
}

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<TicketFields>(emptyFields);
  const [sources, setSources] = useState<Partial<Record<TicketKey, Source>>>({});
  const [imagePreview, setImagePreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [hasUploadedPhoto, setHasUploadedPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"empty" | "analyzing" | "ready" | "demo" | "error">("empty");
  const [error, setError] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [saved, setSaved] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    fetch("/providers.json").then((response) => response.json()).then(setProviders).catch(() => setProviders([]));
  }, []);

  const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const recommendedProviders = providers
    .map((provider) => {
      const product = normalized(fields.product);
      const categories = provider.categories.map(normalized);
      const productMatch = product && categories.some((category) => category.includes(product) || product.includes(category));
      const regionMatch = fields.state && provider.region === fields.state.toUpperCase();
      return { provider, score: (productMatch ? 2 : 0) + (regionMatch ? 1 : 0) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.provider);

  function updateField(field: TicketKey, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setSources((current) => ({ ...current, [field]: "HUMAN" }));
    setSaved(false);
  }

  function fillDemoFields(message: string) {
    setFields(demoFields);
    setSources(Object.fromEntries(Object.keys(demoFields).map((key) => [key, "AI"])) as Partial<Record<TicketKey, Source>>);
    setConfidence(88);
    setStatus("demo");
    setError(message);
  }

  async function analyzeFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setHasUploadedPhoto(false);
      setError("Envie uma imagem JPG, PNG ou WEBP.");
      setStatus("error");
      return;
    }

    setError("");
    setSaved(false);
    setFileName(file.name);
    setHasUploadedPhoto(true);
    setStatus("analyzing");
    setConfidence(0);

    try {
      let image = "";
      try {
        image = await readImage(file);
      } catch {
        fillDemoFields("A foto foi recebida, mas este formato nÃ£o pÃ´de ser prÃ©-visualizado. Use JPG ou PNG para ativar a leitura real.");
        return;
      }
      setImagePreview(image);
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      if (response.ok) {
        const result = await response.json() as { fields: TicketFields; confidence?: number };
        setFields({ ...emptyFields, ...result.fields, photosReceived: "Sim" });
        setSources(Object.fromEntries(Object.keys(emptyFields).map((key) => [key, "AI"])) as Partial<Record<TicketKey, Source>>);
        setConfidence(result.confidence ?? 94);
        setStatus("ready");
        return;
      }

      const result = await response.json().catch(() => ({})) as { error?: string };
      if (result.error === "GEMINI_API_KEY_NOT_CONFIGURED") {
        fillDemoFields("A foto foi recebida. Cadastre GEMINI_API_KEY na Vercel para substituir o preenchimento demonstrativo pela leitura real.");
        return;
      }
      fillDemoFields(result.error || "A foto foi recebida, mas a IA estÃ¡ indisponÃ­vel agora. A ficha continua editÃ¡vel e pode ser salva.");
    } catch (analysisError) {
      fillDemoFields(analysisError instanceof Error ? `${analysisError.message} A ficha continua editÃ¡vel e pode ser salva.` : "A IA estÃ¡ indisponÃ­vel agora. A ficha continua editÃ¡vel e pode ser salva.");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void analyzeFile(file);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void analyzeFile(file);
  }

  function reset() {
    setFields(emptyFields);
    setSources({});
    setImagePreview("");
    setFileName("");
    setHasUploadedPhoto(false);
    setStatus("empty");
    setError("");
    setConfidence(0);
    setSaved(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">F</div><div><div className="brand-name">Felix</div><div className="brand-sub">Copilot</div></div></div>
        <div className="workspace-switcher"><div className="workspace-avatar">SF</div><div className="workspace-copy"><strong>Seu Felix</strong><span>OperaÃ§Ã£o principal</span></div><span className="chevron">âŒ„</span></div>
        <nav className="nav-section">
          <button className="nav-item active"><Icon>ï¼‹</Icon><span>Nova ficha</span><span className="nav-count">+</span></button>
        </nav>
        <div className="sidebar-tip"><span className="tip-icon">âœ¦</span><div><strong>Leitura inteligente</strong><span>Envie uma foto e deixe o Copilot organizar os dados.</span></div></div>
        <div className="sidebar-bottom"><div className="ai-status"><span className="pulse"></span><div><strong>Copilot ativo</strong><span>IA pronta para analisar</span></div></div><button className="user-chip"><span className="user-avatar">DM</span><span>Douglas Lima</span><span className="chevron">âŒ„</span></button></div>
      </aside>

      <section className="content-area">
        <header className="topbar"><div className="breadcrumbs"><span>Seu Felix</span><span className="slash">/</span><strong>Nova ficha</strong></div><div className="topbar-actions"><span className="secure-label"><span>â—</span> ambiente seguro</span><button className="help-button">?</button></div></header>

        <div className="capture-layout"><ProviderRecommendations providers={providers} fields={fields} status={status} onIndicate={(provider) => setFields((current) => ({ ...current, notes: `${current.notes ? `${current.notes} ` : ""}Indicado: ${provider.name} - ${provider.company}.` }))} />
          <section className="capture-panel">
            <div className="page-heading"><div><div className="eyebrow">ENTRADA DO CHAMADO</div><h1>Envie uma foto</h1><p>O Felix Copilot identifica os dados e preenche a ficha de atendimento para vocÃª.</p></div><span className="step-pill">01 <span>/ 01</span></span></div>
            <div className={`dropzone ${isDragging ? "dragging" : ""} ${imagePreview || fileName ? "has-image" : ""}`} onClick={() => fileInput.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInput.current?.click(); }}>
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
              {imagePreview ? <><img src={imagePreview} alt="Imagem enviada para anÃ¡lise" /><div className="image-overlay"><span>Trocar foto</span></div></> : fileName ? <div className="upload-empty file-placeholder"><div className="upload-icon">â–§</div><strong>Foto recebida</strong><span>{fileName}</span><small>A ficha pode ser revisada e salva</small></div> : <div className="upload-empty"><div className="upload-icon">â†¥</div><strong>Arraste a foto aqui</strong><span>ou clique para escolher um arquivo</span><small>JPG, PNG ou WEBP Â· atÃ© 10 MB</small></div>}
            </div>
            {fileName && <div className="file-line"><span className="file-badge">â–§</span><div><strong>{fileName}</strong><span>{status === "analyzing" ? "Preparando imagem para o Copilot..." : "Imagem pronta para revisÃ£o"}</span></div><button onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="Remover foto">Ã—</button></div>}
            <div className={`processing-card ${status}`}><div className="processing-icon">{status === "analyzing" ? <span className="spinner"></span> : status === "ready" || status === "demo" ? "âœ“" : status === "error" ? "!" : "âœ¦"}</div><div><strong>{status === "empty" ? "Pronto para comeÃ§ar" : status === "analyzing" ? "Felix estÃ¡ lendo a foto" : status === "ready" ? "Ficha preenchida pela IA" : status === "demo" ? "Modo demonstraÃ§Ã£o ativo" : status === "error" ? "NÃ£o foi possÃ­vel analisar" : "Envie outra foto quando quiser"}</strong><span>{status === "empty" ? "A anÃ¡lise comeÃ§a automaticamente apÃ³s o envio." : status === "analyzing" ? "Extraindo cliente, equipamento, endereÃ§o e problema..." : status === "ready" ? `${confidence}% de confianÃ§a mÃ©dia Â· Revise os campos destacados.` : status === "demo" ? "Adicione GEMINI_API_KEY na Vercel para ativar a leitura real." : status === "error" ? error : "A ficha estÃ¡ pronta para um novo chamado."}</span></div></div>
            {error && status !== "error" && <div className="inline-error">{error}</div>}
            <div className="capture-footer"><span><Icon>âŒ</Icon> A imagem Ã© usada somente para preencher esta ficha.</span><button className="secondary-button" onClick={reset} disabled={!hasUploadedPhoto}>Limpar</button></div>
          </section>

          <section className="copilot-panel focused"><div className="copilot-header"><div><div className="copilot-title"><span className="sparkle">âœ¦</span> Felix Copilot</div><p>Leitura visual do chamado</p></div><span className="beta-pill">VISION</span></div><div className="copilot-scroll"><div className="vision-card"><div className="card-label-row"><span className="section-label">PROCESSAMENTO</span><span className="confidence"><span className="confidence-dot"></span>{confidence ? `${confidence}% confianÃ§a` : status === "analyzing" ? "analisando..." : "aguardando foto"}</span></div><div className={`vision-steps ${status}`}><div className="vision-step"><span>1</span><div><strong>Receber imagem</strong><small>{imagePreview ? "ConcluÃ­do" : "Aguardando envio"}</small></div></div><div className="vision-step"><span>2</span><div><strong>Identificar informaÃ§Ãµes</strong><small>{status === "analyzing" ? "Em andamento" : status === "ready" || status === "demo" ? "ConcluÃ­do" : "Aguardando"}</small></div></div><div className="vision-step"><span>3</span><div><strong>Preencher ficha</strong><small>{status === "ready" || status === "demo" ? "Pronto para revisar" : "Aguardando"}</small></div></div></div></div><div className="copilot-note"><span>i</span><p>A IA pode errar em nomes, nÃºmeros e modelos. Confira os campos antes de salvar.</p></div><div className="extraction-list"><div className="section-label">O QUE SERÃ IDENTIFICADO</div><div><span>âœ“</span> Cliente e contato</div><div><span>âœ“</span> Equipamento, marca e modelo</div><div><span>âœ“</span> EndereÃ§o e regiÃ£o</div><div><span>âœ“</span> Sintoma e tipo de serviÃ§o</div></div></div></section>

          <aside className="ticket-panel"><div className="ticket-header"><div><div className="eyebrow">RESULTADO DA LEITURA</div><h2>Ficha de atendimento</h2></div><span className={`ai-status-pill ${status}`}><span></span>{status === "ready" || status === "demo" ? "Preenchida" : "Em branco"}</span></div><div className="ticket-scroll"><div className="ticket-summary"><div className="summary-avatar">{fields.customerName ? fields.customerName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "?"}</div><div><strong>{fields.customerName || "Cliente aguardando foto"}</strong><span>{fields.product || "O equipamento aparecerÃ¡ aqui"}</span></div><span className="source-pill"><span className="source-dot"></span>{status === "ready" ? "IA" : "RASCUNHO"}</span></div>{fieldGroups.map((group) => <div className="field-section" key={group.title}><div className="field-section-title">{group.title}<span>âŒƒ</span></div><div className="field-grid">{group.fields.map((field) => <EditableField key={field} field={field} value={fields[field]} source={sources[field]} multiline={field === "problem" || field === "notes"} onChange={(value) => updateField(field, value)} />)}</div></div>)}<div className="ticket-footer-actions"><button className="secondary-button" onClick={() => setFields((current) => ({ ...current, notes: current.notes ? `${current.notes} Ficha revisada pelo operador.` : "Ficha revisada pelo operador." }))}>Marcar como revisada</button><button className="primary-button" disabled={!hasUploadedPhoto || status === "analyzing"} onClick={() => setSaved(true)}>{saved ? "Ficha salva âœ“" : "Salvar ficha"}</button></div>{saved && <div className="saved-message"><span>âœ“</span> Ficha salva no atendimento. VocÃª pode enviar outra foto.</div>}</div></aside>
        </div>
      </section>
    </main>
  );
}

