import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Felix Copilot â€” Atendimento inteligente",
  description: "Copiloto de atendimento para chamados de serviÃ§os e assistÃªncia tÃ©cnica.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
