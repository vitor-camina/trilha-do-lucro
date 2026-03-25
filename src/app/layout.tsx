import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Raio-X do Negócio | Descubra se sua loja está lucrando de verdade",
  description: "Faça o diagnóstico financeiro da sua loja em menos de 3 minutos. Descubra se está lucrando, quanto precisa vender e o que fazer para crescer.",
  openGraph: {
    title: "Raio-X do Negócio | Diagnóstico financeiro para lojistas",
    description: "Descubra em 3 minutos se sua loja está lucrando de verdade. Grátis.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-white text-gray-900">{children}</body>
    </html>
  );
}
