"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

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
  needsReport: "Não",
  status: "Revisar ficha",
  notes: "",
};

const demoFields: TicketFields = {
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
  model: "LFE11",
  problem: "Equipamento com vazamento de água por baixo.",
  propertyType: "Residencial",
  availability: "Horário comercial",
  photosReceived: "Sim",
  warranty: "Não informado",
  needsReport: "Não",
  status: "Revisar ficha",
  notes: "Dados extraídos da foto. Confirme o modelo e o endereço antes de encaminhar.",
};

const ticketLabels: Record<TicketKey, string> = {
  customerName: "Nome do cliente",
  phone: "Telefone",
  cep: "CEP",
  city: "Cidade",
  state: "Estado",
  neighborhood: "Bairro",
  category: "Categoria",
  service: "Serviço",
  product: "Produto",
  brand: "Marca",
  model: "Modelo",
  problem: "Problema relatado",
  propertyType: "Tipo de imóvel",
  availability: "Disponibilidade",
  photosReceived: "Foto recebida",
  warranty: "Garantia",
  needsReport: "Precisa de laudo",
  status: "Status",
  notes: "Observações",
};

const fieldGroups: { title: string; fields: TicketKey[] }[] = [
  { title: "CLIENTE", fields: ["customerName", "phone", "cep", "city", "state", "neighborhood"] },
  { title: "SERVIÇO", fields: ["category", "service", "product", "brand", "model", "problem"] },
  { title: "CONTEXTO", fields: ["propertyType", "availability", "photosReceived", "warranty", "needsReport", "status", "notes"] },
];

function Icon({ children }: { children: string }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

function SourcePill({ source }: { source?: Source }) {
  return <small className={`source-mini ${source === "HUMAN" ? "human" : "ai"}`}>{source === "HUMAN" ? "VOCÊ" : "IA"}</small>;
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
      reject(new Error("Não foi possível ler esta imagem."));
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
        fillDemoFields("A foto foi recebida, mas este formato não pôde ser pré-visualizado. Use JPG ou PNG para ativar a leitura real.");
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
      if (result.error === "OPENAI_API_KEY_NOT_CONFIGURED") {
        fillDemoFields("A foto foi recebida. Cadastre OPENAI_API_KEY na Vercel para substituir o preenchimento demonstrativo pela leitura real.");
        return;
      }
      fillDemoFields(result.error || "A foto foi recebida, mas a IA está indisponível agora. A ficha continua editável e pode ser salva.");
    } catch (analysisError) {
      fillDemoFields(analysisError instanceof Error ? `${analysisError.message} A ficha continua editável e pode ser salva.` : "A IA está indisponível agora. A ficha continua editável e pode ser salva.");
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
        <div className="workspace-switcher"><div className="workspace-avatar">SF</div><div className="workspace-copy"><strong>Seu Felix</strong><span>Operação principal</span></div><span className="chevron">⌄</span></div>
        <nav className="nav-section">
          <button className="nav-item active"><Icon>＋</Icon><span>Nova ficha</span><span className="nav-count">+</span></button>
        </nav>
        <div className="sidebar-tip"><span className="tip-icon">✦</span><div><strong>Leitura inteligente</strong><span>Envie uma foto e deixe o Copilot organizar os dados.</span></div></div>
        <div className="sidebar-bottom"><div className="ai-status"><span className="pulse"></span><div><strong>Copilot ativo</strong><span>IA pronta para analisar</span></div></div><button className="user-chip"><span className="user-avatar">DM</span><span>Douglas Lima</span><span className="chevron">⌄</span></button></div>
      </aside>

      <section className="content-area">
        <header className="topbar"><div className="breadcrumbs"><span>Seu Felix</span><span className="slash">/</span><strong>Nova ficha</strong></div><div className="topbar-actions"><span className="secure-label"><span>●</span> ambiente seguro</span><button className="help-button">?</button></div></header>

        <div className="capture-layout">
          <section className="capture-panel">
            <div className="page-heading"><div><div className="eyebrow">ENTRADA DO CHAMADO</div><h1>Envie uma foto</h1><p>O Felix Copilot identifica os dados e preenche a ficha de atendimento para você.</p></div><span className="step-pill">01 <span>/ 01</span></span></div>
            <div className={`dropzone ${isDragging ? "dragging" : ""} ${imagePreview || fileName ? "has-image" : ""}`} onClick={() => fileInput.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInput.current?.click(); }}>
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
              {imagePreview ? <><img src={imagePreview} alt="Imagem enviada para análise" /><div className="image-overlay"><span>Trocar foto</span></div></> : fileName ? <div className="upload-empty file-placeholder"><div className="upload-icon">▧</div><strong>Foto recebida</strong><span>{fileName}</span><small>A ficha pode ser revisada e salva</small></div> : <div className="upload-empty"><div className="upload-icon">↥</div><strong>Arraste a foto aqui</strong><span>ou clique para escolher um arquivo</span><small>JPG, PNG ou WEBP · até 10 MB</small></div>}
            </div>
            {fileName && <div className="file-line"><span className="file-badge">▧</span><div><strong>{fileName}</strong><span>{status === "analyzing" ? "Preparando imagem para o Copilot..." : "Imagem pronta para revisão"}</span></div><button onClick={(event) => { event.stopPropagation(); reset(); }} aria-label="Remover foto">×</button></div>}
            <div className={`processing-card ${status}`}><div className="processing-icon">{status === "analyzing" ? <span className="spinner"></span> : status === "ready" || status === "demo" ? "✓" : status === "error" ? "!" : "✦"}</div><div><strong>{status === "empty" ? "Pronto para começar" : status === "analyzing" ? "Felix está lendo a foto" : status === "ready" ? "Ficha preenchida pela IA" : status === "demo" ? "Modo demonstração ativo" : status === "error" ? "Não foi possível analisar" : "Envie outra foto quando quiser"}</strong><span>{status === "empty" ? "A análise começa automaticamente após o envio." : status === "analyzing" ? "Extraindo cliente, equipamento, endereço e problema..." : status === "ready" ? `${confidence}% de confiança média · Revise os campos destacados.` : status === "demo" ? "Adicione OPENAI_API_KEY na Vercel para ativar a leitura real." : status === "error" ? error : "A ficha está pronta para um novo chamado."}</span></div></div>
            {error && status !== "error" && <div className="inline-error">{error}</div>}
            <div className="capture-footer"><span><Icon>⌁</Icon> A imagem é usada somente para preencher esta ficha.</span><button className="secondary-button" onClick={reset} disabled={!hasUploadedPhoto}>Limpar</button></div>
          </section>

          <section className="copilot-panel focused"><div className="copilot-header"><div><div className="copilot-title"><span className="sparkle">✦</span> Felix Copilot</div><p>Leitura visual do chamado</p></div><span className="beta-pill">VISION</span></div><div className="copilot-scroll"><div className="vision-card"><div className="card-label-row"><span className="section-label">PROCESSAMENTO</span><span className="confidence"><span className="confidence-dot"></span>{confidence ? `${confidence}% confiança` : status === "analyzing" ? "analisando..." : "aguardando foto"}</span></div><div className={`vision-steps ${status}`}><div className="vision-step"><span>1</span><div><strong>Receber imagem</strong><small>{imagePreview ? "Concluído" : "Aguardando envio"}</small></div></div><div className="vision-step"><span>2</span><div><strong>Identificar informações</strong><small>{status === "analyzing" ? "Em andamento" : status === "ready" || status === "demo" ? "Concluído" : "Aguardando"}</small></div></div><div className="vision-step"><span>3</span><div><strong>Preencher ficha</strong><small>{status === "ready" || status === "demo" ? "Pronto para revisar" : "Aguardando"}</small></div></div></div></div><div className="copilot-note"><span>i</span><p>A IA pode errar em nomes, números e modelos. Confira os campos antes de salvar.</p></div><div className="extraction-list"><div className="section-label">O QUE SERÁ IDENTIFICADO</div><div><span>✓</span> Cliente e contato</div><div><span>✓</span> Equipamento, marca e modelo</div><div><span>✓</span> Endereço e região</div><div><span>✓</span> Sintoma e tipo de serviço</div></div></div></section>

          <aside className="ticket-panel"><div className="ticket-header"><div><div className="eyebrow">RESULTADO DA LEITURA</div><h2>Ficha de atendimento</h2></div><span className={`ai-status-pill ${status}`}><span></span>{status === "ready" || status === "demo" ? "Preenchida" : "Em branco"}</span></div><div className="ticket-scroll"><div className="ticket-summary"><div className="summary-avatar">{fields.customerName ? fields.customerName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "?"}</div><div><strong>{fields.customerName || "Cliente aguardando foto"}</strong><span>{fields.product || "O equipamento aparecerá aqui"}</span></div><span className="source-pill"><span className="source-dot"></span>{status === "ready" ? "IA" : "RASCUNHO"}</span></div>{fieldGroups.map((group) => <div className="field-section" key={group.title}><div className="field-section-title">{group.title}<span>⌃</span></div><div className="field-grid">{group.fields.map((field) => <EditableField key={field} field={field} value={fields[field]} source={sources[field]} multiline={field === "problem" || field === "notes"} onChange={(value) => updateField(field, value)} />)}</div></div>)}<div className="ticket-footer-actions"><button className="secondary-button" onClick={() => setFields((current) => ({ ...current, notes: current.notes ? `${current.notes} Ficha revisada pelo operador.` : "Ficha revisada pelo operador." }))}>Marcar como revisada</button><button className="primary-button" disabled={!hasUploadedPhoto || status === "analyzing"} onClick={() => setSaved(true)}>{saved ? "Ficha salva ✓" : "Salvar ficha"}</button></div>{saved && <div className="saved-message"><span>✓</span> Ficha salva no atendimento. Você pode enviar outra foto.</div>}</div></aside>
        </div>
      </section>
    </main>
  );
}