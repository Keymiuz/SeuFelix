import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fieldKeys = [
  "customerName", "phone", "cep", "city", "state", "neighborhood",
  "category", "service", "product", "brand", "model", "problem",
  "propertyType", "availability", "photosReceived", "warranty",
  "needsReport", "status", "notes",
] as const;

const fieldProperties = Object.fromEntries(fieldKeys.map((key) => [key, { type: "string" }])) as Record<string, { type: "string" }>;

const schema = {
  type: "object",
  additionalProperties: false,
  properties: fieldProperties,
  required: [...fieldKeys],
};

function getOutputText(response: { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) {
  if (response.output_text) return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).find((part) => part.type === "output_text")?.text ?? "";
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { image?: string } | null;
  const image = body?.image ?? "";
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(image) || image.length > 12_000_000) {
    return NextResponse.json({ error: "Imagem inválida ou muito grande." }, { status: 400 });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Analise esta foto de um chamado de assistência técnica. Extraia somente informações visíveis ou claramente legíveis e preencha todos os campos do JSON. Não invente dados: quando algo não estiver visível, use 'Não informado'. Em problem, descreva o sintoma observado. Em notes, registre dúvidas de leitura. Responda em português do Brasil.",
          },
          { type: "input_image", image_url: image, detail: "high" },
        ],
      }],
      text: { format: { type: "json_schema", name: "felix_atendimento", strict: true, schema } },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("OpenAI image analysis failed", response.status, detail);
    return NextResponse.json({ error: "A leitura da foto falhou. Tente novamente." }, { status: 502 });
  }

  const result = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const outputText = getOutputText(result);
  try {
    return NextResponse.json({ fields: JSON.parse(outputText), confidence: 94, source: "ai" });
  } catch {
    console.error("OpenAI image analysis returned invalid JSON", outputText);
    return NextResponse.json({ error: "A resposta da análise veio incompleta. Tente novamente." }, { status: 502 });
  }
}