import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fieldKeys = [
  "customerName", "phone", "cep", "city", "state", "neighborhood",
  "category", "service", "product", "brand", "model", "problem",
  "propertyType", "availability", "photosReceived", "warranty",
  "needsReport", "status", "notes",
] as const;

const schema = {
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(fieldKeys.map((key) => [key, { type: "string" }])),
  required: [...fieldKeys],
};

function getGeminiText(response: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }) {
  return response.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text ?? "";
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { image?: string } | null;
  const image = body?.image ?? "";
  const match = image.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match || image.length > 12_000_000) {
    return NextResponse.json({ error: "Imagem invÃ¡lida ou muito grande." }, { status: 400 });
  }

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent", {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            text: "Analise esta foto de um chamado de assistÃªncia tÃ©cnica. Extraia somente informaÃ§Ãµes visÃ­veis ou claramente legÃ­veis e preencha todos os campos do JSON. NÃ£o invente dados: quando algo nÃ£o estiver visÃ­vel, use 'NÃ£o informado'. Em problem, descreva o sintoma observado. Em notes, registre dÃºvidas de leitura. Responda em portuguÃªs do Brasil.",
          },
          { inlineData: { mimeType: match[1], data: match[2] } },
        ],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Gemini image analysis failed", response.status, detail);
    const error = response.status === 401 || response.status === 403
      ? "O Gemini rejeitou a API key. Gere uma chave nova no Google AI Studio."
      : response.status === 429
        ? "O Gemini informou limite temporÃ¡rio do Free Tier. Tente novamente em instantes."
        : `O Gemini recusou a requisiÃ§Ã£o (erro ${response.status}).`;
    return NextResponse.json({ error, upstreamStatus: response.status }, { status: 502 });
  }

  const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const outputText = getGeminiText(result);
  try {
    return NextResponse.json({ fields: JSON.parse(outputText), confidence: 91, source: "gemini" });
  } catch {
    console.error("Gemini image analysis returned invalid JSON", outputText);
    return NextResponse.json({ error: "A resposta do Gemini veio incompleta. Tente novamente." }, { status: 502 });
  }
}

