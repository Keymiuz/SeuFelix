import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Felix Copilot - Atendimento inteligente",
  description: "Copiloto de atendimento para chamados de servicos e assistencia tecnica.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

