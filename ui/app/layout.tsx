import "./globals.css";

export const metadata = {
  title: "ModelForge — Model Plane",
  description: "SLM · PEFT · CUDA vLLM · LLMOps — hire-facing Model Plane for vpeetla-ai",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
