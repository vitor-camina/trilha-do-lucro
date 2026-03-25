import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trilha do Lucro | Descubra se sua loja está lucrando de verdade",
  description: "Faça o diagnóstico financeiro da sua loja em menos de 3 minutos. Descubra se está lucrando, quanto precisa vender e o que fazer para crescer.",
  openGraph: {
    title: "Trilha do Lucro | Diagnóstico financeiro para lojistas",
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
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable} antialiased`}>
      <body className="font-sans bg-brand-bg text-brand-dark">{children}</body>
    </html>
  );
}
